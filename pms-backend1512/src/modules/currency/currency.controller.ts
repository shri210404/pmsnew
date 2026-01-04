import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('Currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Roles('Admin')
  @Post()
  @ApiOperation({ summary: 'Create a new currency' })
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a currency by ID' })
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update a currency by ID' })
  update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return this.currencyService.update(id, updateCurrencyDto);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a currency by ID' })
  remove(@Param('id') id: string) {
    return this.currencyService.remove(id);
  }
}
