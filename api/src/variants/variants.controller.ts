import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';

@Controller()
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post('products/:productId/variants')
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.variantsService.create(productId, dto);
  }

  @Get('products/:productId/variants')
  findAll(@Param('productId') productId: string) {
    return this.variantsService.findAllForProduct(productId);
  }

  @Get('variants/:id')
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }
}
