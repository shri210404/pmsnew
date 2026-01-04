import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/language.dto';
import { PrismaService } from '@shared/util/prisma.service';

@Injectable()
export class LanguageService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLanguageDto: CreateLanguageDto) {
    return this.prisma.language.create({ data: createLanguageDto });
  }

  findAll() {
    return this.prisma.language.findMany();
  }

  async findOne(id: string) {
    const language = await this.prisma.language.findUnique({ where: { id } });
    if (!language) throw new NotFoundException(`Language with ID ${id} not found`);
    return language;
  }

  async update(id: string, updateLanguageDto: UpdateLanguageDto) {
    await this.findOne(id);
    return this.prisma.language.update({ where: { id }, data: updateLanguageDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.language.delete({ where: { id } });
  }
}
