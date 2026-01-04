import { Logger, Module, forwardRef } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AppLogger } from "@shared/util/applogger.service";
import { PrismaService } from "@shared/util/prisma.service";
import { NodeEmailService } from "@shared/util/sendgridService";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TokenCleanupService } from "./token-cleanup.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService, Logger, AppLogger, PrismaService, NodeEmailService, TokenCleanupService],
  exports: [AuthService], // Export AuthService so other modules can use it
})
export class AuthModule {}
