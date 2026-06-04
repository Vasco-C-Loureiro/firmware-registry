import { Module } from '@nestjs/common';
import { FirmwareService } from './firmware.service';
import { FirmwareController } from './firmware.controller';

@Module({
  controllers: [FirmwareController],
  providers: [FirmwareService],
})
export class FirmwareModule {}
