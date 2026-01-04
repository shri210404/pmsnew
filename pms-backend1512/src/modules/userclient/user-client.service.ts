import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "@shared/util/prisma.service";// Assuming you have a PrismaService for DB access
import { CreateUserClientDto } from './dto/user-client.dto';

@Injectable()
export class UserClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserClientDto: CreateUserClientDto) {
    const { userId, clientId } = createUserClientDto;
    return this.prisma.userClient.create({
      data: {
        userId,
        clientId,
      },
    });
  }

  async findAll() {
    return this.prisma.userClient.findMany({
      include: {
        user: true,
        client: true,
      },
    });
  }

  async findOne(userId: string, clientId: string) {
    return this.prisma.userClient.findUnique({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
      include: {
        user: true,
        client: true,
      },
    });
  }

  async delete(userId: string, clientId: string) {
    return this.prisma.userClient.delete({
      where: {
        userId_clientId: {
          userId,
          clientId,
        },
      },
    });
  }

  async getDetailsByUserId(userId: string) {
    try {
      const userClientDetails = await this.prisma.userClient.findMany({
        where: {
          userId: userId, // Query based on userId
        },
        include: {
          client: true, // Include the client details if needed
        },
      });

      if (!userClientDetails) {
        throw new Error('No details found for the given userId');
      }

      return userClientDetails;
    } catch (error) {
      throw new Error(`Failed to fetch details for userId: ${userId} - ${error.message}`);
    }
  }


  async update(userId: string, clientId: string, updateUserClientDto: CreateUserClientDto) {
    const existingRelation = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
    });

    if (!existingRelation) {
      throw new NotFoundException('User-Client relation not found');
    }

    return this.prisma.userClient.updateMany({
      where: { userId, clientId },
      data: updateUserClientDto,
    });
  }
}
