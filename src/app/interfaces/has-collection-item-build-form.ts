import { ControlValueLabelLangKey } from "@app/types/types";

export interface HasCollectionItemBuildForm {
  identificationNumber: string;
  locationDetails: string;
  buildingNumber: string;
  streetNumber: string;
  zoneNumber: string;
  unitNumber: string;
  latitude: string;
  longitude: string;
  licenseEndDate: string;
  oldLicenseFullSerial: string;

  buildForm(controls: boolean): any
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey }
}
