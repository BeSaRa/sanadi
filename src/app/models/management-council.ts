import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";

export class ManagementCouncil extends SearchableCloneable<ManagementCouncil> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitleId!: string;
  phone!: string;
  mobileNo!: string;
  country!: number;


  getManagementCouncilFields(control: boolean): any {
    const {arabicName, englishName, email, jobTitleId, phone, mobileNo, country} = this;

    return {
      arabicName: control ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arabicName,
      englishName: control ? [englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : englishName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      jobTitleId: control ? [jobTitleId, CustomValidators.required] : jobTitleId,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      country: control ? [country, CustomValidators.required] : country
    };
  }
}
