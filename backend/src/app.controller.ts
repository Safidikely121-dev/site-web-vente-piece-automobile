import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('companies')
  getCompanies() {
    return this.appService.getCompanies();
  }

  @Get('companies/:name')
  getCompany(@Param('name') name: string) {
    return this.appService.getCompany(name);
  }
}
