import { Logger, Module } from "@nestjs/common";

import { PrismaService } from "@shared/util/prisma.service";
import { FileUtil } from "@shared/util/fileutil.helpers";
import { AppLogger } from "@shared/util/applogger.service";
import { FileValidator } from "@shared/util/file-validator.util";

import { ProposalService } from "./proposal.service";
import { ProposalController } from "./proposal.controller";
import { NodeEmailService } from "@shared/util/sendgridService";
import { S3Util } from "@shared/util/s3.util";
import { ResourceAuthorizationHelper } from "@shared/util/resource-authorization.helper";

@Module({
  controllers: [ProposalController],
  providers: [ProposalService, PrismaService, FileUtil, FileValidator, NodeEmailService, S3Util, ResourceAuthorizationHelper, Logger, AppLogger],
})
export class ProposalModule {}
