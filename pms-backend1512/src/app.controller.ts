import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppLogger } from "@shared/util/applogger.service";

@Controller()
export class AppController {
  private readonly logContext = "AppController";
  constructor(
    private readonly appService: AppService,
    private readonly appLogger: AppLogger
  ) {}

@Get()
health() {
  return {
    status: "OK",
    service: "PMS Backend",
  };
}
}
