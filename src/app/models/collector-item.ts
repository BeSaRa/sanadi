import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {mixinApprovalLicenseWithDuration} from '@app/mixins/mixin-approval-license-with-duration';
import {HasLicenseApproval} from '@app/interfaces/has-license-approval';

const _LicenseApproval = mixinApprovalLicenseWithDuration(class {
})

export class CollectorItem extends _LicenseApproval implements HasLicenseApproval {
  id!: string;
  arabicName!: string;
  collectorNumber!: string;
  collectorType!: number;
  gender!: number;
  identificationNumber!: string;
  jobTitle!: string;
  mobileNo!: string;
  nationality!: number;
  phone!: string;
  relationship!: number;
  licenseStatusInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;
  relationshipInfo!: AdminResult;
  collectorTypeInfo!: AdminResult;
  genderInfo!: AdminResult;
  nationalityInfo!: AdminResult;

  constructor() {
    super();
  }

  buildForm(controls: boolean = false): any {
    const {
      collectorType,
      arabicName,
      collectorNumber,
      gender,
      identificationNumber,
      nationality,
      relationship,
      jobTitle,
      phone,
      licenseEndDate,
      oldLicenseFullSerial
    } = this;
    return {
      collectorType: controls ? [collectorType, [CustomValidators.required]] : collectorType,
      arabicName: controls ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_NUM_ONE_AR'), CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]] : arabicName,
      collectorNumber: controls ? [collectorNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : collectorNumber,
      gender: controls ? [gender, [CustomValidators.required]] : gender,
      identificationNumber: controls ? [identificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : identificationNumber,
      nationality: controls ? [nationality, [CustomValidators.required]] : nationality,
      relationship: controls ? [relationship] : relationship,
      jobTitle: controls ? [jobTitle, [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : jobTitle,
      phone: controls ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      licenseEndDate: controls ? [licenseEndDate, [CustomValidators.required]] : licenseEndDate,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
    }
  }
}
