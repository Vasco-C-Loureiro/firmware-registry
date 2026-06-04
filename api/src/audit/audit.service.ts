import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, ReleaseState } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(
    firmwareImageId: string,
    action: AuditAction,
    actor: string,
    extra?: { fromState?: ReleaseState; toState?: ReleaseState; detail?: string },
  ) {
    return this.prisma.auditEvent.create({
      data: {
        firmwareImageId,
        action,
        actor,
        fromState: extra?.fromState,
        toState: extra?.toState,
        detail: extra?.detail,
      },
    });
  }

  findForImage(firmwareImageId: string) {
    return this.prisma.auditEvent.findMany({
      where: { firmwareImageId },
      orderBy: { timestamp: 'desc' },
    });
  }

  findAll() {
    return this.prisma.auditEvent.findMany({
      orderBy: { timestamp: 'desc' },
      include: { firmwareImage: true },
    });
  }
}
