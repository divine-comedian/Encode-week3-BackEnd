import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('token-address')
  getTokenAddress() {
    return { result: this.appService.getTokenAddress() };
  }
  @Post('request-tokens')
  async requestTokens(@Body() body: any): Promise<any> {
    return { result: this.appService.requestTokens(body) };
  }
}
