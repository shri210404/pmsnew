import { ValidationPipe } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";

import fastifyHelmet from "@fastify/helmet";
import fastifyCookie from "@fastify/cookie";
import { ConfigService } from "@nestjs/config";

export const ConfigGlobalMiddlewares = async (app: NestFastifyApplication) => {
  // CORS: Enable, Customization. Cross Origin Resource Sharing //
  const configService = app.get(ConfigService);
  
  // Get allowed origins from environment variable (comma-separated)
  // Default to localhost:4200 for development
  const allowedOriginsEnv = configService.get<string>("CORS_ORIGINS") || "http://localhost:4200";
  const allowedOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());
  
  app.enableCors({
    origin: allowedOrigins, // Angular app URLs from environment
    methods: ['GET', 'POST','PUT', 'DELETE','OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'], // Allowed headers
    credentials: true, // Allow credentials (cookies) - REQUIRED for refresh token
    exposedHeaders: ['X-Correlation-ID'], // Expose custom headers
  });

  // Cookie parser: Enable. //
  const cookieSecret = app.get(ConfigService).get<string>("APP_COOKIE_SECRET");
  await app.register(fastifyCookie, {
    secret: cookieSecret, // for cookies signature
  });

  // Content Security Policy: Customization. //
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`], // Unsafe-inline -> is for allowing swagger styles
        imgSrc: [`'self'`, `data:`], // data:-> is there for displaying images used in Swagger UI
      },
    },
    hsts: { maxAge: 15552000, includeSubDomains: false },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
};
