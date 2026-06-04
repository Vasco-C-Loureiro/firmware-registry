import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  create(productId: string, dto: CreateVariantDto) {
    return this.prisma.variant.create({
      data: { ...dto, productId },
    });
  }

  findAllForProduct(productId: string) {
    return this.prisma.variant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.variant.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    return variant;
  }
}
