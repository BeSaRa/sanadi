import {OperationTypes} from '../enums/operation-types.enum';

export interface IDialogData<D> {
  model: D,
  operation: OperationTypes,

  [index: string]: any
}
