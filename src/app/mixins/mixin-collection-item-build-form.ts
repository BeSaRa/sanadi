import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasCollectionItemBuildForm} from "@app/interfaces/has-collection-item-build-form";
import {CustomValidators} from "@app/validators/custom-validators";

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
        latitude: controls ? [{value: latitude, disabled: true}, [CustomValidators.required]] : latitude,
        longitude: controls ? [{value: longitude, disabled: true}, [CustomValidators.required]] : longitude,
        licenseEndDate: controls ? [licenseEndDate] : licenseEndDate,
        oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      }
    }
  };
}
