import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get('firmware/:firmwareImageId')
  findForImage(@Param('firmwareImageId') firmwareImageId: string) {
    return this.auditService.findForImage(firmwareImageId);
  }
}
