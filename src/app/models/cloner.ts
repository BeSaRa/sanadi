import {ClonerContract} from '@contracts/cloner-contract';

export abstract class Cloner implements ClonerContract {
  clone<T>(override?: Partial<T>): T {
    const constructor = this.constructor;
    // @ts-ignore
    return Object.assign(new constructor(), this, override);
  }
}
