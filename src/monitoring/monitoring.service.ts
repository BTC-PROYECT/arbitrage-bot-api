import { Injectable } from '@nestjs/common';
import web3 from 'web3';
import bigNumber from 'big-number';
import abis from '../configuration/abis';
import addresses from '../configuration/addresses';

@Injectable()
export class MonitoringService {
  start() {
    console.log('start', abis.apeFactory.apeFactory[0]);
  }
}
