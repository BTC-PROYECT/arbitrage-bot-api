import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Arbitrage, ArbitrageSchema } from './schemas/arbitrage.schema';
import { MonitoringService } from './monitoring/monitoring.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://mongodb:27017/arbitrage-bot-api'),
    MongooseModule.forFeature([
      { name: Arbitrage.name, schema: ArbitrageSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, MonitoringService],
})
export class AppModule {}
