import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class BankAccount extends SearchableCloneable<BankAccount> {
  currency!: number;
  accountNumber!: string;
  bankName!: string;
  iBAN!: string;
  swiftCode!: string;
  country!: number;
  bankCategory!: number;

  getBankAccountFields(control: boolean = false): any {
    const {
      currency,
      accountNumber,
      bankName,
      iBAN,
      swiftCode,
      country,
      bankCategory
    } = this;

    return {
      bankName: control ? [bankName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : bankName,
      accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : accountNumber,
      iBAN: control ? [iBAN, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : iBAN,
      swiftCode: control ? [swiftCode, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : swiftCode,
      country: control ? [country, [CustomValidators.required]] : country,
      currency: control ? [currency, [CustomValidators.required]] : currency,
      bankCategory: bankCategory ? [currency, [CustomValidators.required]] : bankCategory
    }
  }

}
