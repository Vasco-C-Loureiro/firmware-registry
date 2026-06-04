import { PartialType } from '@nestjs/mapped-types';
import { CreateFirmwareDto } from './create-firmware.dto';

export class UpdateFirmwareDto extends PartialType(CreateFirmwareDto) {}
