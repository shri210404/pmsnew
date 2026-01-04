import { NestFactory } from "@nestjs/core";
import { NestFastifyApplication, FastifyAdapter } from "@nestjs/platform-fastify";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import fastifyMultipart from "@fastify/multipart";

import { AppModule } from "./app.module";
import { ConfigGlobalMiddlewares } from "@shared/util/middleware.config";
import { ConfigureSwagger } from "@shared/util/swagger.config";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // API prefix
  app.setGlobalPrefix("api/v0/");
  await app.register(fastifyCookie);

  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024 * 10, // 10MB - max file size (covers all upload types, actual limits enforced in validator)
      fieldNameSize: 400, // 400 bytes- max field name size
      fields: 60, // 60 fields- max number of fields
      fieldSize: 400, // 400 bytes- max field value size
      files: 20, // 20 files- max number of files
    },
    attachFieldsToBody: true,
  });

  // Setting up middlewares
  //ConfigGlobalMiddlewares(app);

  // Swagger Configuration.
  ConfigureSwagger(app);

    const PORT = Number(process.env.PORT) || 3000;

  await app.register(fastifyCors, {
    origin: true, // IMPORTANT for Railway
    credentials: true,
  });

  await app.listen(PORT, "0.0.0.0");
  console.log(`🚀 Server running on port ${PORT}`);

}
bootstrap();
