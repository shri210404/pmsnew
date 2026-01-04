import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { PrismaService } from '@shared/util/prisma.service';


@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, PrismaService],
})
export class CurrencyModule {}
