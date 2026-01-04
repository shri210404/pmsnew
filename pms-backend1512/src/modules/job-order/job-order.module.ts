import { Logger, Module } from "@nestjs/common";
import { JobOrderService } from "./job-order.service";
import { JobOrderController } from "./job-order.controller";
import { PrismaService } from "../../shared/util/prisma.service";
import { FileUtil } from "@shared/util/fileutil.helpers";
import { FileValidator } from "@shared/util/file-validator.util";
import { AppLogger } from "@shared/util/applogger.service";
import { S3Util } from "@shared/util/s3.util";

@Module({
  controllers: [JobOrderController],
  providers: [JobOrderService, PrismaService, FileUtil, FileValidator, AppLogger, Logger, S3Util],
})
export class JobOrderModule {}

