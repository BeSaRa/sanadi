import { AdminResult } from './admin-result';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

export class FounderMembers extends SearchableCloneable<FounderMembers> implements IAuditModelProperties<FounderMembers> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  objectDBId!: number;
  itemId!:string;
  identificationNumber!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  nationality!: number;
  nationalityInfo!: AdminResult;
  jobTitle!: string;

  getFounderMembersFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<FounderMembers>(this.getValuesWithLabels())

    return {
      identificationNumber: control ? [values.identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : values.identificationNumber,
      fullName: control ? [values.fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.fullName,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]] : values.email,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      extraPhone: control ? [values.extraPhone, CustomValidators.commonValidations.phone] : values.extraPhone,
      jobTitle: control ? [values.jobTitle, [CustomValidators.required, CustomValidators
        .maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.jobTitle,
      nationality: control ? [values.nationality, [CustomValidators.required]] : values.nationality,
    };
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      fullName: { langKey: 'full_name', value: this.fullName },
      jobTitle: { langKey: 'job_title', value: this.jobTitle },
      email: { langKey: 'email_address_of_the_employer', value: this.email },
      phone: { langKey: 'phone_of_the_employer', value: this.phone },
      extraPhone: { langKey: 'mobile_number', value: this.extraPhone },
      nationality: { langKey: 'lbl_nationality', value: this.nationality },
    };
  }

  getAdminResultByProperty(property: keyof FounderMembers): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'nationality':
        adminResultValue = this.nationalityInfo;
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

  searchFields: ISearchFieldsMap<FounderMembers> = {
    ...normalSearchFields(['identificationNumber', 'fullName', 'email', 'phone', 'extraPhone'])
  };

  isEqual(record: FounderMembers): boolean {
    return this.identificationNumber === record.identificationNumber;
  }
}
