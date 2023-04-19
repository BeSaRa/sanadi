import { AdminResult } from './admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';

export class NpoBankAccount extends SearchableCloneable<NpoBankAccount> {
  objectDBId!: number;
  currency!: number;
  accountNumber!: string;
  bankId!: number;
  iban!: string;
  bankInfo!: AdminResult;
  currencyInfo!: AdminResult;
  constructor() {
    super();
  }

  getBankAccountFields(control: boolean = false): any {
    const {
      currency,
      accountNumber,
      iban,
      bankId
    } = this;
    return {
      bankId: control ? [bankId, [CustomValidators.required]] : bankId,
      accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : accountNumber,
      iban: control ? [iban, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : iban,
      currency: control ? [currency, [CustomValidators.required]] : currency
    };
  }
  searchFields: ISearchFieldsMap<NpoBankAccount> = {
    ...normalSearchFields(['currency','accountNumber','bankId','iban']),
    ...infoSearchFields(['bankInfo','currencyInfo'])
  };
}
