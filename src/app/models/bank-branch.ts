import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from "@app/helpers/date-utils";
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';

export class BankBranch extends SearchableCloneable<BankBranch> implements IAuditModelProperties<BankBranch> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  fullName!: string;
  establishmentDate!: string;
  address!: string;
  email!: string;
  fax!: string;
  recordNo!: string;
  phone!: string;
  postalCode!: string;

  searchFields: ISearchFieldsMap<BankBranch> = {
    ...normalSearchFields(['fullName', 'email', 'fax', 'recordNo', 'phone'])
  };

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      fullName: {langKey: 'full_name', value: this.fullName},
      establishmentDate: {langKey: 'establishment_date', value: this.establishmentDate},
      address: {langKey: 'lbl_address', value: this.address},
      email: {langKey: 'lbl_email', value: this.email},
      fax: {langKey: 'fax_number', value: this.fax},
      recordNo: {langKey: 'record_number', value: this.recordNo},
      phone: {langKey: 'lbl_phone', value: this.phone},
      postalCode: {langKey: 'postal_code', value: this.postalCode}
    };
  }

  getBranchFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<BankBranch>(this.getValuesWithLabels());
    return {
      fullName: control ? [values.fullName, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.fullName,
      establishmentDate: control ? [DateUtils.changeDateToDatepicker(values.establishmentDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(values.establishmentDate),
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : values.email,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      fax: control ? [values.fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : values.fax,
      address: control ? [values.address, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.address,
      recordNo: control ? [values.recordNo, [CustomValidators.maxLength(20)]] : values.recordNo,
      postalCode: control ? [values.postalCode, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : values.postalCode
    }
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof BankBranch): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  isEqual(record: BankBranch): boolean {
    return this.fullName === record.fullName;
  }
}
