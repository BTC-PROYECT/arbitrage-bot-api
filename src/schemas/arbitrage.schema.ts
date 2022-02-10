import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type ArbitrageDocument = Arbitrage & Document;

export class Exchange {
  name: string;
  tokenIn: Token;
  tokenOut: Token;
}

export class Block {
  number: string;
  gasLimit: string;
  timestamp: string;
}

export class Token {
  amount: number;
  token: string;
}

@Schema()
export class Arbitrage {
  @Prop({ type: Block })
  block: Block;

  @Prop()
  pair: string;

  @Prop()
  pairAddress: string;

  @Prop({ type: Token })
  tradingToken: Token;

  @Prop({ type: Exchange })
  exchange1: Exchange;

  @Prop({ type: Exchange })
  exchange2: Exchange;

  @Prop()
  arbitrageOportunityFound: boolean;

  @Prop({ type: Token })
  expectedProfit: Token;

  @Prop()
  createdAt: Date;
}

export const ArbitrageSchema = SchemaFactory.createForClass(Arbitrage);
