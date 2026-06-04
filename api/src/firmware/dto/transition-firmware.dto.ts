import { IsString, IsNotEmpty } from 'class-validator';

export class TransitionFirmwareDto {
  @IsString() @IsNotEmpty()
  state: string;

  @IsString() @IsNotEmpty()
  actor: string;
}
