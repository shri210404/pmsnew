import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LanguageService } from './language.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/language.dto';
import { Roles } from '@shared/decorators/roles.decorator';

@ApiTags('Language')
@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Roles('Admin')
  @Post()
  @ApiOperation({ summary: 'Create a new language' })
  create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languageService.create(createLanguageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a language by ID' })
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(id);
  }

  @Roles('Admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update a language by ID' })
  update(@Param('id') id: string, @Body() updateLanguageDto: UpdateLanguageDto) {
    return this.languageService.update(id, updateLanguageDto);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a language by ID' })
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
  }
}
