import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import abis from '../configuration/abis';
import addresses from '../configuration/addresses';
import erc20 from '../configuration/abis/erc20.json';
import { Arbitrage, ArbitrageDocument } from 'src/schemas/arbitrage.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectModel(Arbitrage.name)
    private arbitrageModel: Model<ArbitrageDocument>,
  ) {}

  async start() {
    const web3 = new Web3(
      new Web3.providers.WebsocketProvider(process.env.BSC_WSS),
    );

    // const { address: admin } = web3.eth.accounts.wallet.add(
    //   process.env.PRIVATE_KEY,
    // );

    //TODO refactory error with types
    const pancakeFactoryAbi: any = abis.pancakeFactory.pancakeFactory;
    const pancakeRouterAbi: any = abis.pancakeRouter.pancakeRouter;

    // we need pancakeSwap
    const pancakeFactory = new web3.eth.Contract(
      pancakeFactoryAbi,
      addresses.pancake.factory,
    );
    const pancakeRouter = new web3.eth.Contract(
      pancakeRouterAbi,
      addresses.pancake.router,
    );

    //TODO refactory error with types
    const bakeryFactoryAbi: any = abis.bakeryFactory.bakeryFactory;
    const bakeryRouterAbi: any = abis.bakeryRouter.bakeryRouter;

    // we need bakerySwap
    const bakeryFactory = new web3.eth.Contract(
      bakeryFactoryAbi,
      addresses.bakery.factory,
    );
    const bakeryRouter = new web3.eth.Contract(
      bakeryRouterAbi,
      addresses.bakery.router,
    );

    const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const fromTokens = ['WBNB'];
    const fromToken = [
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    ];
    const fromTokenDecimals = [18];

    const toTokens = ['BUSD', 'USDC'];
    const toToken = [
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
    ];
    const toTokenDecimals = [18, 18];
    const amount = process.env.BNB_AMOUNT;

    const networkId = await web3.eth.net.getId();

    const subscription = web3.eth
      .subscribe('newBlockHeaders', (error, result) => {
        if (!error) {
          // console.log(result);
          return;
        }
        console.error(error);
      })
      .on('connected', (subscriptionId) => {
        console.log(`You are connected on ${subscriptionId}`);
      })
      .on('data', async (block) => {
        console.log(
          '-------------------------------------------------------------',
        );
        console.log(`New block received. Block # ${block.number}`);
        console.log(
          `GasLimit: ${block.gasLimit} and Timestamp: ${block.timestamp}`,
        );

        for (let i = 0; i < fromTokens.length; i++) {
          for (let j = 0; j < toTokens.length; j++) {
            console.log(`Trading ${toTokens[j]}/${fromTokens[i]} ...`);
            const pairAddress = await pancakeFactory.methods
              .getPair(fromToken[i], toToken[j])
              .call();
            console.log(
              `pairAddress ${toTokens[j]}/${fromTokens[i]} is ${pairAddress}`,
            );

            const unit0 = await new BigNumber(amount);
            const amount0 = await new BigNumber(unit0).shiftedBy(
              fromTokenDecimals[i],
            );
            console.log(
              `Input amount of ${fromTokens[i]}: ${unit0.toString()}`,
            );

            // The quote currency needs to be WBNB
            let tokenIn, tokenOut;
            if (fromToken[i] === WBNB) {
              tokenIn = fromToken[i];
              tokenOut = toToken[j];
            } else if (toToken[j] === WBNB) {
              tokenIn = toToken[j];
              tokenOut = fromToken[i];
            } else {
              return;
            }

            // The quote currency is not WBNB
            if (typeof tokenIn === 'undefined') {
              return;
            }

            // call getAmountsOut in PancakeSwap
            const amounts = await pancakeRouter.methods
              .getAmountsOut(amount0, [tokenIn, tokenOut])
              .call();
            const unit1 = await new BigNumber(amounts[1]).shiftedBy(
              -toTokenDecimals[j],
            );
            const amount1 = await new BigNumber(amounts[1]);
            console.log(`
                    Buying token at PancakeSwap DEX
                    =================
                    tokenIn: ${unit0.toString()} ${fromTokens[i]}
                    tokenOut: ${unit1.toString()} ${toTokens[j]}
                `);

            // call getAmountsOut in BakerySwap
            const amounts2 = await bakeryRouter.methods
              .getAmountsOut(amount1, [tokenOut, tokenIn])
              .call();
            const unit2 = await new BigNumber(amounts2[1]).shiftedBy(
              -fromTokenDecimals[i],
            );
            const amount2 = await new BigNumber(amounts2[1]);
            console.log(`
                    Buying back token at BakerySwap DEX
                    =================
                    tokenOut: ${unit1.toString()} ${toTokens[j]}
                    tokenIn: ${unit2.toString()} ${fromTokens[i]}
                `);

            const profit = await new BigNumber(amount2).minus(amount0);
            const unit3 = await new BigNumber(unit2).minus(unit0);
            // not consider transaction cost in here
            console.log(`Profit in ${fromTokens[i]}: ${unit3.toString()}`);

            const arbitrageOportunityFound = profit.gt(0);

            if (arbitrageOportunityFound) {
              console.log(`
                        Block # ${block.number}: Arbitrage opportunity found!
                        Expected profit: ${unit3.toString()} in ${fromTokens[i]}
                    `);
            } else {
              console.log(`
                        Block # ${
                          block.number
                        }: Arbitrage opportunity not found!
                        Expected profit: ${unit3.toString()} in ${fromTokens[i]}
                    `);
            }

            const arbitrage = {
              block: {
                number: block.number,
                gasLimit: block.gasLimit,
                timestamp: block.timestamp,
              },
              pair: `${toTokens[j]}/${fromTokens[i]}`,
              pairAddress: pairAddress,
              tradingToken: {
                amount: unit0,
                token: fromTokens[i],
              },
              exchange1: {
                name: 'PancakeSwap DEX',
                tokenIn: {
                  amount: unit0,
                  token: fromTokens[i],
                },
                tokenOut: {
                  amount: unit1,
                  token: toTokens[j],
                },
              },
              exchange2: {
                name: 'BakerySwap DEX',
                tokenIn: {
                  amount: unit1,
                  token: toTokens[j],
                },
                tokenOut: {
                  amount: unit2,
                  token: fromTokens[i],
                },
              },
              arbitrageOportunityFound: arbitrageOportunityFound,
              expectedProfit: {
                amount: unit3,
                token: fromTokens[i],
              },
              createdAt: new Date().toISOString(),
            };

            const createdArbitrage = new this.arbitrageModel(arbitrage);

            return createdArbitrage.save();
          }
        }
      })
      .on('error', (error) => {
        console.log(error);
      });
  }
}
