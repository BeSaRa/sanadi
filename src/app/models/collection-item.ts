import {AdminResult} from "@app/models/admin-result";
import {CustomValidators} from "@app/validators/custom-validators";
import {Cloneable} from "@app/models/cloneable";

export class CollectionItem extends Cloneable<CollectionItem> {
  buildingNumber!: string
  currentVersion!: number
  currentVersionDate!: string
  customTerms!: string
  exportedLicenseFullserial!: string
  exportedLicenseId!: string
  exportedLicenseSerial!: number
  identificationNumber!: string
  licenseDurationType!: number
  licenseVSID!: string
  licenseStatus!: number
  licenseStartDate!: string
  licenseApprovedDate!: string
  licenseEndDate!: string
  locationDetails!: string
  latitude!: string
  longitude!: string
  oldLicenseFullserial!: string
  oldLicenseId!: string
  oldLicenseSerial!: number
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
      oldLicenseFullserial
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
      oldLicenseFullserial: controls ? [oldLicenseFullserial] : oldLicenseFullserial,
    }
  }
}
