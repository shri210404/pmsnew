import { Logger, Module } from "@nestjs/common";

import { PrismaService } from "@shared/util/prisma.service";
import { FileUtil } from "@shared/util/fileutil.helpers";
import { FileValidator } from "@shared/util/file-validator.util";
import { AppLogger } from "@shared/util/applogger.service";

import { NodeEmailService } from "@shared/util/sendgridService";
import { S3Util } from "@shared/util/s3.util";
import { FutureJobController } from "./futureJobs.controller";
import { FtutureJobService } from "./futureJobs.service";
import { ProposalService } from "@modules/proposal/proposal.service";

@Module({
  controllers: [FutureJobController],
  providers: [FtutureJobService, PrismaService, FileUtil, FileValidator, AppLogger, Logger, ProposalService, NodeEmailService, S3Util,],
})
export class FutureJobsModule {}
