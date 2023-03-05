import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';

export class ExecutiveManagement extends SearchableCloneable<ExecutiveManagement> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: number;
  phone!: string;
  passportNumber!: string;

  searchFields: ISearchFieldsMap<ExecutiveManagement> = {
    ...normalSearchFields(['arabicName', 'englishName', 'jobTitle', 'email', 'phone', 'passportNumber'])
  };

  searchFieldsNoPassport: ISearchFieldsMap<ExecutiveManagement> = {
    ...normalSearchFields(['arabicName', 'englishName', 'jobTitle', 'email', 'phone'])
  };

  getManagerFields(control: boolean = false): any {
    const {
      arabicName,
      englishName,
      email,
      jobTitle,
      phone,
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
      passportNumber: control ? [passportNumber, [...CustomValidators.commonValidations.passport]] : passportNumber
    }
  }
}
