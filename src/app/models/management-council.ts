import {normalSearchFields} from '@helpers/normal-search-fields';
import {AdminResult} from './admin-result';
import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {ISearchFieldsMap} from '@app/types/types';

export class ManagementCouncil extends SearchableCloneable<ManagementCouncil> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  // mobileNo!: string;
  nationality!: number;
  passportNumber!: string;
  nationalityInfo!: AdminResult

  searchFields: ISearchFieldsMap<ManagementCouncil> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'jobTitle', 'email', 'passportNumber', 'phone'])
  };

  getManagementCouncilFields(control: boolean): any {
    const {arabicName, englishName, email, jobTitle, phone, nationality, passportNumber} = this;

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
      nationality: control ? [nationality, CustomValidators.required] : nationality,
      passportNumber: control ? [passportNumber, [...CustomValidators.commonValidations.passport]] : passportNumber
    };
  }
}
