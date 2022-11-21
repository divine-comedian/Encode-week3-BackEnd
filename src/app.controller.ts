import { Body, Controller, Get, Post } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { AppService } from './app.service';

export class mintDto {
  address: string;
  amount: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('proposals')
  getProposals() {
    return this.appService.getProposals();
  }
  @Get('token-address')
  getTokenAddress() {
    return { result: this.appService.getTokenAddress() };
  }
  @Post('request-tokens')
  async requestTokens(@Body() body: mintDto): Promise<any> {
    return await this.appService.requestTokens(body);
  }
}
