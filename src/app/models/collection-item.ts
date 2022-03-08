import {AdminResult} from "@app/models/admin-result";
import {CustomValidators} from "@app/validators/custom-validators";
import {Cloneable} from "@app/models/cloneable";
import {LicenseApprovalInterface} from "@app/interfaces/license-approval-interface";
import {DateUtils} from "@app/helpers/date-utils";
import {LicenseDurationType} from "@app/enums/license-duration-type";

export class CollectionItem extends Cloneable<CollectionItem> implements LicenseApprovalInterface {
  followUpDate!: string;
  conditionalLicenseIndicator: boolean = false;
  publicTerms!: string;
  customTerms!: string
  exportedLicenseFullSerial!: string
  exportedLicenseId!: string
  exportedLicenseSerial!: number
  licenseStatus!: number
  licenseStartDate!: string
  licenseApprovedDate!: string
  licenseEndDate!: string
  oldLicenseFullSerial!: string
  oldLicenseId!: string
  oldLicenseSerial!: number
  buildingNumber!: string
  identificationNumber!: string
  licenseDurationType!: number
  licenseVSID!: string
  currentVersion!: number
  currentVersionDate!: string
  locationDetails!: string
  latitude!: string
  longitude!: string
  requestClassification!: number
  streetNumber!: string
  unitNumber!: string
  zoneNumber!: string
  licenseStatusInfo!: AdminResult
  licenseDurationTypeInfo!: AdminResult

  buildForm(controls: boolean = false): any {
    const {
      identificationNumber,
      locationDetails,
      buildingNumber,
      streetNumber,
      zoneNumber,
      unitNumber,
      latitude,
      longitude,
      licenseEndDate,
      oldLicenseFullSerial
    } = this;
    return {
      identificationNumber: controls ? [identificationNumber, [CustomValidators.required]] : identificationNumber,
      locationDetails: controls ? [locationDetails, [CustomValidators.required]] : locationDetails,
      buildingNumber: controls ? [buildingNumber, [CustomValidators.required]] : buildingNumber,
      streetNumber: controls ? [streetNumber, [CustomValidators.required]] : streetNumber,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required]] : zoneNumber,
      unitNumber: controls ? [unitNumber, [CustomValidators.required]] : unitNumber,
      latitude: controls ? [latitude, [CustomValidators.required]] : latitude,
      longitude: controls ? [longitude, [CustomValidators.required]] : longitude,
      licenseEndDate: controls ? [licenseEndDate] : licenseEndDate,
      oldLicenseFullserial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
    }
  }

  buildApprovalForm(controls: boolean = false): any {
    const {
      licenseStartDate,
      licenseEndDate,
      followUpDate,
      conditionalLicenseIndicator,
      publicTerms,
      customTerms,
    } = this;
    return {
      licenseStartDate: controls ? [DateUtils.changeDateToDatepicker(licenseStartDate), CustomValidators.required] : DateUtils.changeDateToDatepicker(licenseStartDate),
      licenseEndDate: controls ? [DateUtils.changeDateToDatepicker(licenseEndDate)] : DateUtils.changeDateToDatepicker(licenseEndDate),
      followUpDate: controls ? [DateUtils.changeDateToDatepicker(followUpDate)] : DateUtils.changeDateToDatepicker(followUpDate),
      conditionalLicenseIndicator: controls ? [conditionalLicenseIndicator] : conditionalLicenseIndicator,
      publicTerms: controls ? [{value: publicTerms, disabled: true}] : publicTerms,
      customTerms: controls ? [customTerms] : customTerms
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
