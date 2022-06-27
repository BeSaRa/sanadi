import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {Lookup} from '@app/models/lookup';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class BeneficiaryObligation extends SearchableCloneable<BeneficiaryObligation> {
  id?: number;
  periodicType!: number;
  benObligationType!: number;
  amount!: number;
  notes!: string;
  installmentsCount: number = 0;

  updatedBy?: number;
  clientData?: string;
  writeOnly?: boolean;

  //extra properties
  periodicTypeInfo!: Lookup;
  benObligationTypeInfo!: Lookup;

  searchFields: ISearchFieldsMap<BeneficiaryObligation> = {
    ...infoSearchFields(['periodicTypeInfo', 'benObligationTypeInfo']),
    ...normalSearchFields(['amount', 'installmentsCount'])
  };

  buildForm(controls?: boolean): any {
    const {periodicType, benObligationType, amount, notes, installmentsCount} = this;
    return {
      periodicType: controls ? [periodicType, [CustomValidators.required]] : periodicType,
      benObligationType: controls ? [benObligationType, [CustomValidators.required]] : benObligationType,
      amount: controls ? [amount, [CustomValidators.required, Validators.min(0), CustomValidators.decimal(2)]] : amount,
      installmentsCount: controls ? [installmentsCount, [CustomValidators.required, Validators.min(0)]] : installmentsCount,
      notes: controls ? [notes, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : notes
    }
  }
}
