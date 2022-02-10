import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from './app.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { Arbitrage, ArbitrageDocument } from './schemas/arbitrage.schema';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Arbitrage.name)
    private arbitrageModel: Model<ArbitrageDocument>,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Get()
  async insertArbitrage() {
    this.monitoringService.start();

    return 'start';
  }
}
