import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {Lookup} from '@app/models/lookup';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';

export class BeneficiaryIncome extends SearchableCloneable<BeneficiaryIncome> {
  id?: number;
  periodicType!: number;
  benIncomeType!: number;
  amount!: number;
  notes!: string;

  //extra properties
  periodicTypeInfo!: Lookup;
  benIncomeTypeInfo!: Lookup;

  updatedBy?: number;
  clientData?: string;
  writeOnly?: boolean;

  searchFields: ISearchFieldsMap<BeneficiaryIncome> = {
    ...normalSearchFields(['amount']),
    ...infoSearchFields(['benIncomeTypeInfo', 'periodicTypeInfo'])
  }

  buildForm(controls?: boolean): any {
    const {periodicType, benIncomeType, amount, notes} = this;
    return {
      periodicType: controls ? [periodicType, [CustomValidators.required]] : periodicType,
      benIncomeType: controls ? [benIncomeType, [CustomValidators.required]] : benIncomeType,
      amount: controls ? [amount, [CustomValidators.required, Validators.min(0)]] : amount,
      notes: controls ? [notes, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : notes
    }
  }
}
