import { AdminResult } from './admin-result';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CommonUtils } from '@app/helpers/common-utils';

export class NpoBankAccount extends SearchableCloneable<NpoBankAccount> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
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
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      currency: { langKey: 'lbl_phone', value: this.currency },
      accountNumber: { langKey: 'account_number', value: this.accountNumber },
      iban: { langKey: 'iban', value: this.iban },
      bankId: { langKey: 'currency', value: this.bankId },
    };
  }

  getAdminResultByProperty(property: keyof NpoBankAccount): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'bankId':
        adminResultValue = this.bankInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
