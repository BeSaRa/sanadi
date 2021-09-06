import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';

export class ExecutiveManagement extends SearchableCloneable<ExecutiveManagement> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  country!: number;

  getManagerFields(control: boolean = false): any {
    const {
      arabicName,
      englishName,
      email,
      jobTitle,
      phone,
      country
    } = this;

    return {
      arabicName: control ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arabicName,
      englishName: control ? [englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : englishName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      jobTitle: control ? [jobTitle, [CustomValidators.required]] : jobTitle,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      country: control ? [country, [CustomValidators.required]] : country
    }
  }
}
