import {OperationTypes} from '@enums/operation-types.enum';
import {CaseTypes} from '@enums/case-types.enum';
import {IKeyValue} from '@contracts/i-key-value';

export interface UiCrudDialogComponentDataContract<M> {
  model: M,
  operation: OperationTypes,
  list: M[],
  caseType?: CaseTypes,
  extras?: IKeyValue
}
