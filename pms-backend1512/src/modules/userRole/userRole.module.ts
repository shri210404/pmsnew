import { Module, forwardRef } from '@nestjs/common';
import { UserRoleService } from './userRole.service';
import { UserRoleController } from './userRole.controller';
import { PrismaService } from "../../shared/util/prisma.service";
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UserRoleService, PrismaService],
  controllers: [UserRoleController],
})
export class UserRoleModule {}
