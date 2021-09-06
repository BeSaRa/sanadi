import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class BankAccount extends SearchableCloneable<BankAccount> {
  currency!: number;
  accountNumber!: string;
  bankName!: string;
  getiBAN!: string;
  swiftCode!: string;
  country!: number;
  bankCategory!: number;

  getBankAccountFields(control: boolean = false): any {
    const {
      currency,
      accountNumber,
      bankName,
      getiBAN,
      swiftCode,
      country,
      bankCategory
    } = this;

    return {
      bankName: control ? [bankName, [CustomValidators.required]] : bankName,
      accountNumber: control ? [accountNumber, [CustomValidators.required]] : accountNumber,
      getiBAN: control ? [getiBAN, [CustomValidators.required]] : getiBAN,
      swiftCode: control ? [swiftCode, [CustomValidators.required]] : swiftCode,
      country: control ? [country, [CustomValidators.required]] : country,
      currency: control ? [currency, [CustomValidators.required]] : currency,
      bankCategory: bankCategory ? [currency, [CustomValidators.required]] : bankCategory
    }
  }

}
