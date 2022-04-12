import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {Lookup} from '@app/models/lookup';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class BeneficiaryObligation extends SearchableCloneable<BeneficiaryObligation> {
  id!: number;
  periodicType!: number;
  benObligationType!: number;
  amount!: number;
  notes!: string;
  installementsCount!: number;

  updatedBy?: number;
  clientData?: string;
  writeOnly?: boolean;

  //extra properties
  periodicTypeInfo!: Lookup;
  benObligationTypeInfo!: Lookup;

  searchFields: ISearchFieldsMap<BeneficiaryObligation> = {
    ...infoSearchFields(['periodicTypeInfo', 'benObligationTypeInfo']),
    ...normalSearchFields(['amount', 'installementsCount'])
  };

  buildForm(controls?: boolean): any {
    const {periodicType, benObligationType, amount, notes, installementsCount} = this;
    return {
      periodicType: controls ? [periodicType, [CustomValidators.required]] : periodicType,
      benObligationType: controls ? [benObligationType, [CustomValidators.required]] : benObligationType,
      amount: controls ? [amount, [CustomValidators.required, Validators.min(0)]] : amount,
      installementsCount: controls ? [installementsCount, [CustomValidators.required, Validators.min(0)]] : installementsCount,
      notes: controls ? [notes, [CustomValidators.required, CustomValidators.maxLength(1200)]] : notes
    }
  }
}
