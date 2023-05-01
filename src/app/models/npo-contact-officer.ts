import { AdminResult } from './admin-result';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';

export class NpoContactOfficer extends SearchableCloneable<NpoContactOfficer>{
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  officerId!: number;
  identificationNumber!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  jobTitleId!: number;

  jobInfo!: AdminResult;

  getContactOfficerFields(control: boolean): any {
    const { identificationNumber, fullName, email, phone, extraPhone, jobTitleId } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
    };
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      fullName: { langKey: 'full_name', value: this.fullName },
      email: { langKey: 'email_address_of_the_employer', value: this.email },
      phone: { langKey: 'phone_of_the_employer', value: this.phone },
      extraPhone: { langKey: 'mobile_number', value: this.extraPhone },
      jobTitleId: { langKey: 'job_title', value: this.jobTitleId },
    };
  }

  getAdminResultByProperty(property: keyof NpoContactOfficer): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'jobTitleId':
        adminResultValue = this.jobInfo;
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
