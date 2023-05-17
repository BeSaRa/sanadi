import {AdminResult} from './admin-result';
import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';

export class FounderMembers extends SearchableCloneable<FounderMembers> implements IAuditModelProperties<FounderMembers> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  objectDBId!: number;
  identificationNumber!: string;
  fullName!: string;
  jobTitleId!: number;
  email!: string;
  phone!: string;
  extraPhone!: string;
  nationality!: number;
  jobTitleInfo!: AdminResult;
  nationalityInfo!: AdminResult;

  getFounderMembersFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<FounderMembers>(this.getValuesWithLabels())

    return {
      identificationNumber: control ? [values.identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : values.identificationNumber,
      fullName: control ? [values.fullName, [CustomValidators.required, CustomValidators.maxLength(300),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.fullName,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]] : values.email,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      extraPhone: control ? [values.extraPhone, CustomValidators.commonValidations.phone] : values.extraPhone,
      jobTitleId: control ? [values.jobTitleId, [CustomValidators.required]] : values.jobTitleId,
      nationality: control ? [values.nationality, [CustomValidators.required]] : values.nationality,
    };
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber: {langKey: 'lbl_phone', value: this.identificationNumber},
      fullName: {langKey: 'lbl_email', value: this.fullName},
      jobTitleId: {langKey: 'lbl_email', value: this.jobTitleId},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_email', value: this.phone},
      extraPhone: {langKey: 'lbl_email', value: this.extraPhone},
      nationality: {langKey: 'lbl_email', value: this.nationality},
    };
  }

  getAdminResultByProperty(property: keyof FounderMembers): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'jobTitleId':
        adminResultValue = this.jobTitleInfo;
        break;
      case 'nationality':
        adminResultValue = this.nationalityInfo;
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

  searchFields: ISearchFieldsMap<FounderMembers> = {
    ...normalSearchFields(['identificationNumber', 'fullName', 'email', 'phone', 'extraPhone'])
  };
}
