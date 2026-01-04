import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/util/prisma.service";
import { CreateTemplateWithFieldsDto } from "./dto/create-template-with-fields.dto";

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async create(createTemplateWithFieldsDto: CreateTemplateWithFieldsDto) {
    const { templateName, location, client, remarks, createdBy,fields } = createTemplateWithFieldsDto;

    return this.prisma.template.create({
      data: {
        templateName,
        location,
        client,
        remarks,
        createdBy,
        fields: {
          create: fields.map((field) => ({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            formControlName: field.formControlName,
          })),
        },
      },
      include: {
        fields: true,
      },
    });
  }

  async findAll() {
    return this.prisma.template.findMany({
      include: { fields: true }, // Fetch templates with fields
    });
  }

  async findOne(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
      include: { fields: true }, // Include fields for specific template
    });
  }

  async findByName(templateName: string) {
    return this.prisma.template.findFirst({
      where: { templateName },
      include: { fields: true }, // Include fields for template by name
    });
  }

  async updateById(id: string, updateTemplateDto: CreateTemplateWithFieldsDto) {
    const { templateName, location, client, remarks, createdBy,fields } = updateTemplateDto;

    return this.prisma.template.update({
      where: { id },
      data: {
        templateName,
        location,
        client,
        remarks,
        createdBy,
        fields: {
          deleteMany: {}, // Clear existing fields before updating
          create: fields.map((field) => ({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            formControlName: field.formControlName,
          })),
        },
      },
      include: {
        fields: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.template.delete({
      where: { id },
    });
  }
}
