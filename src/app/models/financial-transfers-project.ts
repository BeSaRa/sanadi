import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '../validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
export class FinancialTransfersProject extends SearchableCloneable<FinancialTransfersProject> {
  fullSerial!: string;
  qatariTransactionAmount!: number;
  notes!: string;
  projectTotalCost!: number;
  remainingAmount!: number;
  transferAmount!: number;
  dueAmount!: number;
  projectName!: string;

  searchFields: ISearchFieldsMap<FinancialTransfersProject> = {
    ...normalSearchFields(['fullSerial', 'qatariTransactionAmount', 'notes']),
  };
  getFormFields(control = false): any {
    const { fullSerial, qatariTransactionAmount, notes ,
      projectTotalCost,
      remainingAmount,
      transferAmount,
      dueAmount,
    } = this;
    return {
      fullSerial: control
        ? [
            fullSerial,
            [

              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : fullSerial,
      qatariTransactionAmount: control
        ? [
            qatariTransactionAmount,
            [CustomValidators.required, CustomValidators.decimal(CustomValidators.defaultLengths.DECIMAL_PLACES)],
          ]
        : qatariTransactionAmount,
      notes: control
        ? [
            notes,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : notes,
        projectTotalCost : [projectTotalCost],
        remainingAmount : [remainingAmount],
        transferAmount : [transferAmount],
        dueAmount : [dueAmount],
    };
  }
}
