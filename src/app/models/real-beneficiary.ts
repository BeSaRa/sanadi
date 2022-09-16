import { DateUtils } from './../helpers/date-utils';
import { Validators } from '@angular/forms';
import { IMyDateModel } from 'angular-mydatepicker';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";

export class RealBeneficiary extends SearchableCloneable<RealBeneficiary>{
  arabicName!: string;
  englishName!: string;
  birthLocation!: string;
  nationality!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  identificationNumber!: string;
  passportNumber!: string;
  birthDate!: Date | IMyDateModel;
  iDDate!: Date | IMyDateModel;
  passportDate!: Date | IMyDateModel;
  iDExpiryDate!: Date | IMyDateModel;
  passportExpiryDate!: Date | IMyDateModel;
  startDate!: Date | IMyDateModel;
  lastUpdateDate!: Date | IMyDateModel;
  getRealBeneficiaryFields(control: boolean): any {
    const {
      identificationNumber,
      arabicName,
      englishName,
      nationality,

      zoneNumber,
      streetNumber,
      buildingNumber,
      address,
      birthLocation,
      passportNumber,

      iDDate,
      birthDate,
      iDExpiryDate,
      passportDate,
      passportExpiryDate,
      startDate,
      lastUpdateDate
    } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      arabicName: control ? [arabicName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arabicName,
      englishName: control ? [englishName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : englishName,
      nationality: control ? [nationality, [CustomValidators.required]] : nationality,
      zoneNumber: control ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : zoneNumber,
      streetNumber: control ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : streetNumber,
      buildingNumber: control ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(200)]] : buildingNumber,
      address: control ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
      passportNumber: control ? [passportNumber] : passportNumber, // CustomValidators.required conditional
      birthLocation: control ? [birthLocation, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX), CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : birthLocation,
      iDDate: control ? [DateUtils.changeDateToDatepicker(iDDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(iDDate),
      birthDate: control ? [DateUtils.changeDateToDatepicker(birthDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(birthDate),
      iDExpiryDate: control ? [DateUtils.changeDateToDatepicker(iDExpiryDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(iDExpiryDate),
      passportDate: control ? [DateUtils.changeDateToDatepicker(passportDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(passportDate),
      passportExpiryDate: control ? [DateUtils.changeDateToDatepicker(passportExpiryDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(passportExpiryDate),
      startDate: control ? [DateUtils.changeDateToDatepicker(startDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(startDate),
      lastUpdateDate: control ? [DateUtils.changeDateToDatepicker(lastUpdateDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(lastUpdateDate),
    };
  }
}
