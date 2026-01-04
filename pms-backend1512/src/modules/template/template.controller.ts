import { Controller, Get, Post, Body, Param, Delete, Put } from "@nestjs/common";
import { TemplateService } from "./template.service";
import { CreateTemplateWithFieldsDto } from "./dto/create-template-with-fields.dto";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "@shared/decorators/roles.decorator";

@ApiTags("Templates")
@Controller("templates")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Roles('Admin', 'HR Manager')
  @Post()
  create(@Body() createTemplateWithFieldsDto: CreateTemplateWithFieldsDto) {
    return this.templateService.create(createTemplateWithFieldsDto);
  }

  @Get()
  findAll() {
    return this.templateService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.templateService.findOne(id);
  }

  @Get("name/:templateName")
  findByName(@Param("templateName") templateName: string) {
    return this.templateService.findByName(templateName);
  }

  @Roles('Admin', 'HR Manager')
  @Put(":id")
  updateById(@Param("id") id: string, @Body() updateTemplateDto: CreateTemplateWithFieldsDto) {
    return this.templateService.updateById(id, updateTemplateDto);
  }

  @Roles('Admin')
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.templateService.delete(id);
  }
}
