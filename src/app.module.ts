import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Arbitrage, ArbitrageSchema } from './schemas/arbitrage.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/arbitrage-bot-api'), 
    MongooseModule.forFeature([{ name: Arbitrage.name, schema: ArbitrageSchema }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
