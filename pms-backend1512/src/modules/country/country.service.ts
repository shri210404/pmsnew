import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/util/prisma.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    return this.prisma.country.create({
      data: {
        countryName: createCountryDto.countryName,
      },
    });
  }

  async findAll() {
    return this.prisma.country.findMany();
  }

  async findOne(id: string) {
    return this.prisma.country.findUnique({ where: { id } });
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    return this.prisma.country.update({
      where: { id },
      data: {
        countryName: updateCountryDto.countryName,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.country.delete({ where: { id } });
  }
}
