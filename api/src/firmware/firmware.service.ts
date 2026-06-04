import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateFirmwareDto } from './dto/create-firmware.dto';
import { TransitionFirmwareDto } from './dto/transition-firmware.dto';
import { canTransition } from './release-state';
import { ReleaseState } from '@prisma/client';
import { createHash } from 'crypto';
import { promises as fs, createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FirmwareService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(
    variantId: string,
    file: Express.Multer.File,
    dto: CreateFirmwareDto,
  ) {
    const variant = await this.prisma.variant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const storageDir = join(process.env.STORAGE_DIR ?? 'storage', variantId);
    await fs.mkdir(storageDir, { recursive: true });
    const storagePath = join(storageDir, `${dto.version}-${file.originalname}`);
    await fs.writeFile(storagePath, file.buffer);

    const image = await this.prisma.firmwareImage.create({
      data: {
        variantId,
        version: dto.version,
        fileName: file.originalname,
        storagePath,
        fileSizeBytes: file.size,
        checksumSha256: checksum,
        uploadedBy: dto.uploadedBy,
        state: 'DRAFT',
      },
    });

    await this.audit.log(image.id, 'UPLOADED', dto.uploadedBy, {
      detail: `checksum ${checksum}`,
    });

    return image;
  }

  findAll(variantId?: string, state?: string) {
    return this.prisma.firmwareImage.findMany({
      where: {
        ...(variantId && { variantId }),
        ...(state && { state: state as ReleaseState }),
      },
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.firmwareImage.findUnique({
      where: { id },
      include: { variant: { include: { product: true } } },
    });
    if (!image) throw new NotFoundException(`Firmware image ${id} not found`);
    return image;
  }

  async download(id: string, actor: string) {
    const image = await this.prisma.firmwareImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`Firmware image ${id} not found`);

    const buffer = await fs.readFile(image.storagePath);
    const actual = createHash('sha256').update(buffer).digest('hex');
    if (actual !== image.checksumSha256) {
      throw new ConflictException('Checksum mismatch: stored file may be corrupted');
    }

    await this.audit.log(id, 'DOWNLOADED', actor);

    return new StreamableFile(createReadStream(image.storagePath), {
      disposition: `attachment; filename="${image.fileName}"`,
    });
  }

  async transition(id: string, dto: TransitionFirmwareDto) {
    const image = await this.prisma.firmwareImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`Firmware image ${id} not found`);

    const to = dto.state as ReleaseState;
    if (!Object.values(ReleaseState).includes(to)) {
      throw new BadRequestException(`Invalid state: ${dto.state}`);
    }
    if (!canTransition(image.state, to)) {
      throw new BadRequestException(`Illegal transition: ${image.state} -> ${to}`);
    }

    const ops: any[] = [];
    if (to === ReleaseState.RELEASED) {
      ops.push(
        this.prisma.firmwareImage.updateMany({
          where: { variantId: image.variantId, state: ReleaseState.RELEASED },
          data: { state: ReleaseState.DEPRECATED },
        }),
      );
    }
    ops.push(
      this.prisma.firmwareImage.update({ where: { id }, data: { state: to } }),
    );
    await this.prisma.$transaction(ops);

    await this.audit.log(id, 'STATE_CHANGED', dto.actor, {
      fromState: image.state,
      toState: to,
    });

    return this.prisma.firmwareImage.findUnique({ where: { id } });
  }
}
