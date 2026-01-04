import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';
import { PrismaService } from '@shared/util/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCurrencyDto: CreateCurrencyDto) {
    return this.prisma.currency.create({ data: createCurrencyDto });
  }

  findAll() {
    return this.prisma.currency.findMany();
  }

  async findOne(id: string) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) throw new NotFoundException(`Currency with ID ${id} not found`);
    return currency;
  }

  async update(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    await this.findOne(id);
    return this.prisma.currency.update({ where: { id }, data: updateCurrencyDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.currency.delete({ where: { id } });
  }
}
