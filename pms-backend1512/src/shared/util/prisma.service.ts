import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Enable logging
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to the database');
    } catch (error) {
      this.logger.error('Could not connect to the database', error);
      throw error; // Optionally rethrow the error after logging it
    }

    // Listen for Prisma Client events
  }
}
