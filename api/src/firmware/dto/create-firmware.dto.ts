import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFirmwareDto {
  @IsString() @IsNotEmpty()
  version: string;

  @IsString() @IsNotEmpty()
  uploadedBy: string;
}
