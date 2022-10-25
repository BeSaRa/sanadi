import { normalSearchFields } from '@helpers/normal-search-fields';
import { AdminResult } from './admin-result';
import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { ISearchFieldsMap } from '@app/types/types';

export class ManagementCouncil extends SearchableCloneable<ManagementCouncil> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  // mobileNo!: string;
  country!: number;
  countryInfo!:AdminResult

  searchFields: ISearchFieldsMap<ManagementCouncil> = {
    ...infoSearchFields(['countryInfo']),
    ...normalSearchFields(['arabicName','englishName','jobTitle','email','phone'])
  };
  getManagementCouncilFields(control: boolean): any {
    const {arabicName, englishName, email, jobTitle, phone, country} = this;

    return {
      arabicName: control ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arabicName,
      englishName: control ? [englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : englishName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      jobTitle: control ? [jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : jobTitle,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      // mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      country: control ? [country, CustomValidators.required] : country
    };
  }
}
