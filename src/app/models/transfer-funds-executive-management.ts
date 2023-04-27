import { ControlValueLabelLangKey } from './../types/types';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { CustomValidators } from '@app/validators/custom-validators';

export class TransferFundsExecutiveManagement extends SearchableCloneable<TransferFundsExecutiveManagement>{
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  nameLikePassport!: string;
  englishNameLikePassport!: string;
  jobTitle!: string;
  executiveNationality!: number;
  executiveIdentificationNumber!: string;
  executivephone1!: string;
  executivephone2!: string;
  passportNumber!: string;
  executiveNationalityInfo!: AdminResult;
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      nameLikePassport: { langKey: 'name_in_local_language_like_passport', value: this.nameLikePassport },
      englishNameLikePassport: { langKey: 'name_in_English_language_like_passport', value: this.englishNameLikePassport },
      jobTitle: { langKey: 'job_title', value: this.jobTitle },
      executiveNationality: { langKey: 'lbl_nationality', value: this.executiveNationality },
      executiveIdentificationNumber: { langKey: 'national_id_number', value: this.executiveIdentificationNumber },
      passportNumber: { langKey: 'passport_number', value: this.passportNumber },
      executivephone1: { langKey: 'lbl_phone_1', value: this.executivephone1 },
      executivephone2: { langKey: 'lbl_phone_2', value: this.executivephone2 },
    };
  }
  buildForm(control: boolean = false) {
    const {
      nameLikePassport,
      englishNameLikePassport,
      jobTitle,
      executiveNationality,
      executiveIdentificationNumber,
      passportNumber,
      executivephone1,
      executivephone2,
    } = this
    return {
      nameLikePassport: control ? [nameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : nameLikePassport,
      englishNameLikePassport: control ? [englishNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : englishNameLikePassport,
      jobTitle: control ? [jobTitle, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : jobTitle,
      executiveNationality: control ? [executiveNationality, [CustomValidators.required]] : executiveNationality,
      executiveIdentificationNumber: control ? [executiveIdentificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : executiveIdentificationNumber,
      passportNumber: control ? [passportNumber, [CustomValidators.required, ...CustomValidators.commonValidations.passport]] : passportNumber,
      executivephone1: control ? [executivephone1, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : executivephone1,
      executivephone2: control ? [executivephone2, CustomValidators.commonValidations.phone] : executivephone2
    }
  }
  getAdminResultByProperty(property: keyof TransferFundsExecutiveManagement): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'executiveNationality':
        adminResultValue = this.executiveNationalityInfo;
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
