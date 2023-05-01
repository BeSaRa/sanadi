import { AdminResult } from './admin-result';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';

export class FounderMembers extends SearchableCloneable<FounderMembers>{
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
    const {
      identificationNumber,
      fullName,
      jobTitleId,
      email,
      phone,
      extraPhone,
      nationality
    } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
      nationality: control ? [nationality, [CustomValidators.required]] : nationality,
    };
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber: { langKey: 'lbl_phone', value: this.identificationNumber },
      fullName: { langKey: 'lbl_email', value: this.fullName },
      jobTitleId: { langKey: 'lbl_email', value: this.jobTitleId },
      email: { langKey: 'lbl_email', value: this.email },
      phone: { langKey: 'lbl_email', value: this.phone },
      extraPhone: { langKey: 'lbl_email', value: this.extraPhone },
      nationality: { langKey: 'lbl_email', value: this.nationality },
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
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
}
