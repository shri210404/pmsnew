import { resolve } from "path";
import { readFileSync } from "fs";

import { Global, Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";

const privateKeyFilePath = resolve("certs/private.key"),
  publicKeyFilePath = resolve("certs/public.pem");

const privateKeyCert = readFileSync(privateKeyFilePath),
  publicKeyCert = readFileSync(publicKeyFilePath);

@Global()
@Module({
  imports: [
    JwtModule.register({
      privateKey: privateKeyCert,
      publicKey: publicKeyCert,
      signOptions: {
        expiresIn: "5m",
        algorithm: "ES512",
      },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class AppJWTModule {}
