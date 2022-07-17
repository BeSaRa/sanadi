import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CaseTypes} from '@app/enums/case-types.enum';
import {Bank} from '@app/models/bank';

export class BankAccount extends SearchableCloneable<BankAccount> {
  id!: number;
  currency!: number;
  accountNumber!: string;
  bankName!: string;
  iBan!: string;
  swiftCode!: string;
  country!: number;
  category?: number;
  bankInfo!: Bank;

  constructor() {
    super();
  }

  getBankAccountFields(control: boolean = false, caseType?: CaseTypes): any {
    const {
      currency,
      accountNumber,
      bankName,
      iBan,
      swiftCode,
      country,
      category
    } = this;
    // if no case type or case type is not partner approval
    let showCategory = (caseType !== CaseTypes.PARTNER_APPROVAL),
      controls: any = {
        bankName: control ? [bankName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : bankName,
        accountNumber: control ? [accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : accountNumber,
        iBan: control ? [iBan, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : iBan,
        swiftCode: control ? [swiftCode, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.SWIFT_CODE_MAX)]] : swiftCode,
        country: control ? [country, [CustomValidators.required]] : country,
        currency: control ? [currency, [CustomValidators.required]] : currency
      };

    if (showCategory) {
      controls.category = (control ? [category, [CustomValidators.required]] : category);
    }

    return controls;
  }

}
