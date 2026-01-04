import { Module } from '@nestjs/common';
import { UserClientService } from './user-client.service';
import { UserClientController } from './user-client.controller';
import { PrismaService } from "@shared/util/prisma.service"; 

@Module({
  imports: [],
  controllers: [UserClientController],
  providers: [UserClientService, PrismaService],
})
export class UserClientModule {}
