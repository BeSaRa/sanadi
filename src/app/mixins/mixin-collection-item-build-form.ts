import {Constructor} from "@app/helpers/constructor";
import {AbstractConstructor} from "@app/helpers/abstract-constructor";
import {HasCollectionItemBuildForm} from "@app/interfaces/has-collection-item-build-form";
import {CustomValidators} from "@app/validators/custom-validators";
import {DateUtils} from '@app/helpers/date-utils';
import { ControlValueLabelLangKey } from "@app/types/types";
import { ObjectUtils } from "@app/helpers/object-utils";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";

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
    itemId!: string

    getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
      return {
        itemId:{langKey: {} as keyof ILanguageKeys, value: this.itemId,skipAuditComparison :true},
        identificationNumber:{langKey: 'identification_number', value: this.identificationNumber},
        locationDetails:{langKey: 'location_details', value: this.locationDetails},
        latitude:{langKey: 'latitude', value: this.latitude},
        longitude:{langKey: 'longitude', value: this.longitude},
        licenseEndDate:{langKey: 'license_end_date', value: this.licenseEndDate},
        oldLicenseFullSerial:{langKey: 'serial_number', value: this.oldLicenseFullSerial},
        buildingNumber:{langKey: 'building_number', value: this.buildingNumber},
        streetNumber:{langKey: 'lbl_street', value: this.streetNumber},
        zoneNumber:{langKey: 'lbl_zone', value: this.zoneNumber},
        unitNumber:{langKey: 'unit', value: this.unitNumber},
      };

    }
    buildForm(controls: boolean = false): any {
      const values = ObjectUtils.getControlValues<HasCollectionItemBuildForm>(this.getValuesWithLabels());

      return {
        identificationNumber: controls ? [values.identificationNumber, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.identificationNumber,
        locationDetails: controls ? [values.locationDetails, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.locationDetails,
        latitude: controls ? [{value: values.latitude, disabled: true}, [CustomValidators.required]] : values.latitude,
        longitude: controls ? [{value: values.longitude, disabled: true}, [CustomValidators.required]] : values.longitude,
        licenseEndDate: controls ? [DateUtils.changeDateToDatepicker(values.licenseEndDate)] : DateUtils.changeDateToDatepicker(values.licenseEndDate),
        oldLicenseFullSerial: controls ? [values.oldLicenseFullSerial] : values.oldLicenseFullSerial,
      }
    }
  };
}
