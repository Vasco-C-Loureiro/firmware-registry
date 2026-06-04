import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirmwareService } from './firmware.service';
import { CreateFirmwareDto } from './dto/create-firmware.dto';
import { TransitionFirmwareDto } from './dto/transition-firmware.dto';
import type { Response } from 'express';

@Controller()
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Post('variants/:variantId/firmware')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('variantId') variantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFirmwareDto,
  ) {
    return this.firmwareService.create(variantId, file, dto);
  }

  @Get('firmware')
  findAll(
    @Query('variantId') variantId?: string,
    @Query('state') state?: string,
  ) {
    return this.firmwareService.findAll(variantId, state);
  }

  @Get('firmware/:id')
  findOne(@Param('id') id: string) {
    return this.firmwareService.findOne(id);
  }

  @Get('firmware/:id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.firmwareService.download(id);
    file.getStream().pipe(res);
  }

  @Patch('firmware/:id/state')
  transition(@Param('id') id: string, @Body() dto: TransitionFirmwareDto) {
    return this.firmwareService.transition(id, dto);
  }
}
