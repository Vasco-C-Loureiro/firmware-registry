import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { FirmwareModule } from './firmware/firmware.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [PrismaModule, ProductsModule, VariantsModule, FirmwareModule, AuditModule],
})
export class AppModule {}
