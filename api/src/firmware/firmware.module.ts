import { Module } from '@nestjs/common';
import { FirmwareService } from './firmware.service';
import { FirmwareController } from './firmware.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FirmwareController],
  providers: [FirmwareService],
})
export class FirmwareModule {}
