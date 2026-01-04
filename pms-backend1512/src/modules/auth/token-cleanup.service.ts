import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/util/prisma.service';
import { AppLogger } from '@shared/util/applogger.service';

@Injectable()
export class TokenCleanupService {
  private readonly logContext = 'TokenCleanupService';
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private appLogger: AppLogger,
  ) {}

  /**
   * Clean up expired tokens daily at 2 AM
   * This removes tokens older than the maximum refresh token age
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleTokenCleanup() {
    this.logger.log('Starting token cleanup job...', this.logContext);

    try {
      // Get refresh token expiry days from config (default: 7 days)
      const refreshTokenExpiryDays = parseInt(
        this.configService.get<string>('REFRESH_TOKEN_EXPIRY_DAYS') || '7',
        10,
      );

      // Calculate cutoff date (tokens older than this will be deleted)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - refreshTokenExpiryDays - 1); // Add 1 day buffer

      // Delete tokens older than max refresh token age
      // Also delete revoked tokens older than 30 days (cleanup old revoked tokens)
      const revokedCutoffDate = new Date();
      revokedCutoffDate.setDate(revokedCutoffDate.getDate() - 30); // Keep revoked tokens for 30 days for audit

      // Delete expired active tokens
      const expiredResult = await this.prismaService.token.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRevoked: false,
        },
      });

      // Delete old revoked tokens (older than 30 days)
      const revokedResult = await this.prismaService.token.deleteMany({
        where: {
          revokedAt: {
            lt: revokedCutoffDate,
          },
          isRevoked: true,
        },
      });

      const totalDeleted = expiredResult.count + revokedResult.count;

      this.appLogger.log(
        `Token cleanup completed: Deleted ${expiredResult.count} expired tokens and ${revokedResult.count} old revoked tokens (total: ${totalDeleted})`,
        this.logContext,
      );

      this.logger.log('Token cleanup job completed', this.logContext);
    } catch (error) {
      this.logger.error(
        `Token cleanup job failed: ${error.message}`,
        this.logContext,
      );
      this.appLogger.error(
        `Token cleanup job failed: ${error.message}`,
        this.logContext,
      );
    }
  }

  /**
   * Manual cleanup method that can be called on demand
   */
  async cleanupExpiredTokens(): Promise<number> {
    const refreshTokenExpiryDays = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRY_DAYS') || '7',
      10,
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - refreshTokenExpiryDays - 1);

    const revokedCutoffDate = new Date();
    revokedCutoffDate.setDate(revokedCutoffDate.getDate() - 30);

    const expiredResult = await this.prismaService.token.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRevoked: false,
      },
    });

    const revokedResult = await this.prismaService.token.deleteMany({
      where: {
        revokedAt: {
          lt: revokedCutoffDate,
        },
        isRevoked: true,
      },
    });

    return expiredResult.count + revokedResult.count;
  }
}

