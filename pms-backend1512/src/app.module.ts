import { Logger, Module } from "@nestjs/common";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { HttpExceptionFilter } from "@shared/filters/http-exception.filter";
import { CorrelationInterceptor } from "@shared/interceptors/correlation.interceptor";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthModule } from "@modules/auth/auth.module";
//import { TemplateModule } from "@modules/template/template.module";
import { CountryModule } from "@modules/country/country.module";
import { ClientModule } from "@modules/clients/client.module";
//import { ProposalModule } from "@modules/proposal/proposal.module";

import { AppJWTModule } from "@shared/modules/appjwt.module";
import { AppLogger } from "@shared/util/applogger.service";
import { PrismaService } from "@shared/util/prisma.service";
import { EmployeeModule } from "@modules/employee/employee.module";
import { RoleModule } from "@modules/role/role.module";
import { UserRoleModule } from "@modules/userRole/userRole.module";
import { ProposalModule } from "@modules/proposal/proposal.module";
import { TemplateModule } from "@modules/template/template.module";
import { UserClientModule } from "@modules/userclient/user-client.module";
import { LanguageModule } from "@modules/language/language.module";
import { CurrencyModule } from "@modules/currency/currency.module";
import { S3Util } from "@shared/util/s3.util";
import { FutureJobsModule } from "@modules/futureJobs/futureJobs.module";
import { ProposalService } from "@modules/proposal/proposal.service";
import { JobOrderModule } from "@modules/job-order/job-order.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 100, // 100 requests per hour
      },
    ]),
    AppJWTModule,
    AuthModule,
    EmployeeModule,
    RoleModule,
    UserRoleModule,
    TemplateModule,
    CountryModule,
    ClientModule,
    ProposalModule,
    UserClientModule,
    LanguageModule,
    CurrencyModule,
    FutureJobsModule,
    JobOrderModule
    
  ],
  controllers: [AppController,],
  providers: [
    AppService,
    ConfigService,
    Logger,
    AppLogger,
    PrismaService,
    S3Util,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
  ],
})
export class AppModule {}
