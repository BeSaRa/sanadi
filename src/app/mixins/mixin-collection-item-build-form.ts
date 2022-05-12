import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasCollectionItemBuildForm} from "@app/interfaces/has-collection-item-build-form";
import {CustomValidators} from "@app/validators/custom-validators";
import {DateUtils} from '@app/helpers/date-utils';

type CanBuildForm = Constructor<HasCollectionItemBuildForm> & AbstractConstructor<HasCollectionItemBuildForm>

export function mixinCollectionItemBuildForm<T extends AbstractConstructor<{}>>(baseClass: T): T & CanBuildForm;
export function mixinCollectionItemBuildForm<T extends Constructor<{}>>(baseClass: T): T & CanBuildForm {
  return class extends baseClass {
    identificationNumber!: string;
    locationDetails!: string;
    buildingNumber!: string;
    streetNumber!: string;
    zoneNumber!: string;
    unitNumber!: string;
    latitude!: string;
    longitude!: string;
    licenseEndDate!: string;
    oldLicenseFullSerial!: string;

    buildForm(controls: boolean = false): any {
      const {
        identificationNumber,
        locationDetails,
        latitude,
        longitude,
        licenseEndDate,
        oldLicenseFullSerial
      } = this;
      return {
        identificationNumber: controls ? [identificationNumber, [CustomValidators.required, CustomValidators.maxLength(50)]] : identificationNumber,
        locationDetails: controls ? [locationDetails, [CustomValidators.required, CustomValidators.maxLength(50)]] : locationDetails,
        latitude: controls ? [{value: latitude, disabled: true}, [CustomValidators.required]] : latitude,
        longitude: controls ? [{value: longitude, disabled: true}, [CustomValidators.required]] : longitude,
        licenseEndDate: controls ? [DateUtils.changeDateToDatepicker(licenseEndDate)] : DateUtils.changeDateToDatepicker(licenseEndDate),
        oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      }
    }
  };
}
