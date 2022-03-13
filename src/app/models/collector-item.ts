import {LicenseApproval} from '@app/models/license-approval';
import {LicenseDurationType} from '@app/enums/license-duration-type';
import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';

export class CollectorItem extends LicenseApproval {
  arabicName!: string;
  collectorNumber!: string;
  collectorType!: number;
  currentVersion!: number;
  currentVersionDate!: string;
  gender!: number;
  identificationNumber!: string;
  jobTitle!: string;
  licenseDurationType!: number;
  licenseVSID!: string;
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
      arabicName: controls ? [arabicName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]] : arabicName,
      collectorNumber: controls ? [collectorNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : collectorNumber,
      gender: controls ? [gender, [CustomValidators.required]] : gender,
      identificationNumber: controls ? [identificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : identificationNumber,
      nationality: controls ? [nationality, [CustomValidators.required]] : nationality,
      relationship: controls ? [relationship, [CustomValidators.required]] : relationship,
      jobTitle: controls ? [jobTitle, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : jobTitle,
      phone: controls ? [phone, [CustomValidators.required]] : phone,
      licenseEndDate: controls ? [licenseEndDate] : licenseEndDate,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
    }
  }

  private hasLicenseStartDate(): boolean {
    return !!this.licenseStartDate;
  }

  private hasLicenseEndDate(): boolean {
    return !!this.licenseEndDate;
  }

  hasValidApprovalInfo(): boolean {
    return this.licenseDurationType === LicenseDurationType.PERMANENT ? (this.hasLicenseStartDate() && this.hasLicenseEndDate()) : this.hasLicenseStartDate()
  }
}
