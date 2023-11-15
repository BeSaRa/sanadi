import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CaseTypes} from '@app/enums/case-types.enum';
import {Bank} from '@app/models/bank';
import {Lookup} from '@app/models/lookup';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';

export class BankAccount extends SearchableCloneable<BankAccount> implements IAuditModelProperties<BankAccount> {
  id!: number;
  currency!: number;
  accountNumber!: string;
  bankName!: string;
  iBan!: string;
  swiftCode!: string;
  country!: number;
  partnerName!: string;
  orgId!: number;
  iBAN!: string;
  category?: number;
  bankInfo!: Bank;
  isMergeAccount!: boolean;
  itemId!: string;
  subAccounts: BankAccount[] = [];
  bankCategoryInfo!: Lookup;
  type!: number;
  currencyInfo!: AdminResult;
  countryInfo!: AdminResult;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<BankAccount> = {
    ...infoSearchFields(['countryInfo']),
    ...normalSearchFields(['bankName', 'accountNumber', 'iBan']),
  };

  constructor() {
    super();
  }

  getBankAccountValuesWithLabels(caseType?: CaseTypes): { [key: string]: ControlValueLabelLangKey } {
    const valuesWithLabels: { [key: string]: ControlValueLabelLangKey } = {
      bankName: {langKey: 'bank_name', value: this.bankName},
      accountNumber: {langKey: 'account_number', value: this.accountNumber},
      iBan: {langKey: 'iban', value: this.iBan},
      swiftCode: {langKey: 'swift_code', value: this.swiftCode},
      country: {langKey: 'country', value: this.country},
      currency: {langKey: 'currency', value: this.currency},
      partnerName: {langKey: 'org_name_in_bank', value: this.partnerName},
      category: {langKey: 'bank_category', value: this.category},
    };
    if (caseType === CaseTypes.PARTNER_APPROVAL) {
      delete valuesWithLabels.category;
    } else {
      delete valuesWithLabels.partnerName;
    }
    return valuesWithLabels;
  }

  getBankAccountFields(control: boolean = false, caseType?: CaseTypes): any {
    const values = ObjectUtils.getControlValues<BankAccount>(this.getBankAccountValuesWithLabels(caseType));
    let controls: any = {
      bankName: control ? [values.bankName, [
        CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
      ]] : values.bankName,
      accountNumber: control ? [values.accountNumber, [
        CustomValidators.required,
        CustomValidators.number,
        CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH),
      ]] : values.accountNumber,
      iBan: control ? [values.iBan, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.NUMBERS_MAXLENGTH),
      ]] : values.iBan,
      swiftCode: control ? [values.swiftCode, [
        CustomValidators.required,
        ...CustomValidators.commonValidations.swiftCode
      ]] : values.swiftCode,
      country: control ? [values.country, [CustomValidators.required]] : values.country,
      currency: control ? [values.currency, [CustomValidators.required]] : values.currency,
    };

    // if no case type or case type is not partner approval
    if (caseType !== CaseTypes.PARTNER_APPROVAL) {
      controls.category = control ? [values.category, [CustomValidators.required]] : values.category;
    } else {
      controls.partnerName = control ? [values.partnerName, [
        CustomValidators.required,
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
      ]] : values.partnerName;
    }

    return controls;
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof BankAccount): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'currency':
        adminResultValue = this.currencyInfo;
        break;
      case 'category':
        adminResultValue = this.bankCategoryInfo?.convertToAdminResult();
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

  isEqual(record: BankAccount): boolean {
    return this.iBan === record.iBan
  }
}
