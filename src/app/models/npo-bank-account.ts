import {AdminResult} from './admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {CurrencyEnum} from "@enums/currency-enum";

export class NpoBankAccount extends SearchableCloneable<NpoBankAccount> implements IAuditModelProperties<NpoBankAccount> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  objectDBId!: number;
  itemId!:string;
  currency: number = CurrencyEnum.UNITED_STATE_DOLLAR;
  accountNumber!: string;
  bankId!: number;
  iban!: string;
  bankInfo!: AdminResult;
  currencyInfo!: AdminResult;

  constructor() {
    super();
  }

  getBankAccountFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<NpoBankAccount>(this.getValuesWithLabels())

    return {
      bankId: control ? [values.bankId, [CustomValidators.required]] : values.bankId,
      accountNumber: control ? [values.accountNumber, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.accountNumber,
      iban: control ? [values.iban, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH)]] : values.iban,
      currency: control ? [{value: values.currency, disabled: true}, [CustomValidators.required]] : values.currency
    };
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      currency: {langKey: 'lbl_phone', value: this.currency},
      accountNumber: {langKey: 'account_number', value: this.accountNumber},
      iban: {langKey: 'iban', value: this.iban},
      bankId: {langKey: 'currency', value: this.bankId},
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
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  searchFields: ISearchFieldsMap<NpoBankAccount> = {
    ...normalSearchFields(['accountNumber', 'iban']),
    ...infoSearchFields(['bankInfo'])
  };

  isEqual(record: NpoBankAccount): boolean {
    return this.iban === record.iban;
  }
}
