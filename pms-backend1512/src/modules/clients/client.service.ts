import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/util/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        clientName: createClientDto.clientName,
      },
    });
  }

  async findAll() {
    return this.prisma.client.findMany();
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: {
        clientName: updateClientDto.clientName,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.client.delete({ where: { id } });
  }
}
