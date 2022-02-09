import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from './app.service';
import { Arbitrage, ArbitrageDocument } from './schemas/arbitrage.schema';

@Controller()
export class AppController {
  constructor(@InjectModel(Arbitrage.name) private arbitrageModel: Model<ArbitrageDocument>, private readonly appService: AppService) {}

  @Get()
  async insertArbitrage() {
    const arbitrage = {
      pair: 'BNB/USDT',
      pairAddress: 'test',
      input_amount: '100',
      trading_token: 'BNB',
      exchange_1: { 
        name: 'pankakeswap',
        token_in: '100',
        token_out: '1000'
      },
      exchange_2: {
        name: 'pankakeswap',
        token_in: '100',
        token_out: '1000'
      },
      arbitrage_oportunity_found: true,
      expected_profit: '10',
      createdAt: new Date().toISOString()
    }

    const createdArbitrage = new this.arbitrageModel(arbitrage);

    return createdArbitrage.save();
  }
}
