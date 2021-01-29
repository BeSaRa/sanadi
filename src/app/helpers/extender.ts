import {cloneDeep} from 'lodash';

export const extender: <T>(model: any, ...values: any) => T = <T>(model: any, ...values: any): T => {
  let myModel;
  try {
    myModel = new model();
  } catch (e) {
    myModel = new model.constructor;
  }

  return cloneDeep(Object.assign.apply(this, [myModel, ...values])) as T;
};


