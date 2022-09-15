import { DateUtils } from './../helpers/date-utils';
import { IMyDateModel } from 'angular-mydatepicker';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";

export class FounderMembers extends SearchableCloneable<FounderMembers>{
  identificationNumber!: string;
  fullName!: string;
  jobTitleId!: number;
  email!: string;
  phone!: string;
  extraPhone!: string;
  joinDate!: Date | IMyDateModel;
  nationality!: number;
  getContactOfficerFields(control: boolean): any {
    const { identificationNumber,
      fullName,
      jobTitleId,
      email,
      phone,
      extraPhone,
      joinDate,
      nationality } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
      nationality: control ? [nationality, [CustomValidators.required]] : nationality,
      joinDate: control ? [DateUtils.changeDateToDatepicker(joinDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(joinDate),
    };
  }
}
