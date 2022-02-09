import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type ArbitrageDocument = Arbitrage & Document;

export class Exchange {
  name: string;
  token_in: string;
  token_out: string;
}

@Schema()
export class Arbitrage {
  @Prop()
  pair: string;

  @Prop()
  pairAddress: string;

  @Prop()
  input_amount: number;

  @Prop()
  trading_token: string;

  @Prop({ type: Exchange })
  exchange_1: Exchange;

  @Prop({ type: Exchange })
  exchange_2: Exchange;

  @Prop()
  arbitrage_oportunity_found: boolean;

  @Prop()
  expected_profit: number;

  @Prop()
  createdAt: Date;
}

export const ArbitrageSchema = SchemaFactory.createForClass(Arbitrage);
