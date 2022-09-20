import { AdminResult } from './admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';

export class NpoBankAccount extends SearchableCloneable<NpoBankAccount> {
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
      accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : accountNumber,
      iban: control ? [iban, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : iban,
      currency: control ? [currency, [CustomValidators.required]] : currency
    };
  }
}
