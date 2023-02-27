import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from './admin-result';

export class ExecutiveManagement extends SearchableCloneable<ExecutiveManagement> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: number;
  phone!: string;
  nationality!: number;
  passportNumber!: string;
  nationalityInfo!: AdminResult

  searchFields: ISearchFieldsMap<ExecutiveManagement> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'jobTitle', 'email', 'phone', 'passportNumber'])
  };

  searchFieldsNoPassport: ISearchFieldsMap<ExecutiveManagement> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'jobTitle', 'email', 'phone'])
  };

  getManagerFields(control: boolean = false): any {
    const {
      arabicName,
      englishName,
      email,
      jobTitle,
      phone,
      nationality,
      passportNumber
    } = this;

    return {
      arabicName: control ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arabicName,
      englishName: control ? [englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : englishName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
      jobTitle: control ? [jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : jobTitle,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      nationality: control ? [nationality, [CustomValidators.required]] : nationality,
      passportNumber: control ? [passportNumber, [...CustomValidators.commonValidations.passport]] : passportNumber
    }
  }
}
