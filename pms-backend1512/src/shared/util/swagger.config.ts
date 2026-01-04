import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const ConfigureSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("API Auth")
    .setDescription("API for implementation of authentication & authorization process")
    .setVersion("1.0")
    .addTag("Auth")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);
};
