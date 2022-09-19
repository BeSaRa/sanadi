import { AdminResult } from './admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';

export class NpoBankAccount extends SearchableCloneable<NpoBankAccount> {
  currency!: number;
  accountNumber!: string;
  bankId!: number;
  iBan!: string;
  bankInfo!: AdminResult;
  currencyInfo!: AdminResult;
  constructor() {
    super();
  }

  getBankAccountFields(control: boolean = false): any {
    const {
      currency,
      accountNumber,
      iBan,
      bankId
    } = this;
    return {
      bankId: control ? [bankId, [CustomValidators.required]] : bankId,
      accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : accountNumber,
      iBan: control ? [iBan, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : iBan,
      currency: control ? [currency, [CustomValidators.required]] : currency
    };
  }
}
