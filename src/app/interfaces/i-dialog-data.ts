import {OperationTypes} from '../enums/operation-types.enum';

export interface IDialogData<D> {
  model: D,
  operation: OperationTypes,
  extraData?:any

  [index: string]: any
}
