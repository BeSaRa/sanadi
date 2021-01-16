import {cloneDeep} from 'lodash';

export const extender: <T>(model: any, ...values: any) => T = <T>(model: any, ...values: any): T => {
  // @ts-ignore
  return cloneDeep(Object.assign.apply(this, [new model(), ...values])) as T;
};


