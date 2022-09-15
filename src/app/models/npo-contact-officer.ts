import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";

export class NpoContactOfficer extends SearchableCloneable<NpoContactOfficer>{
  identificationNumber!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  jobTitleId!: number;

  getContactOfficerFields(control: boolean): any {
    const { identificationNumber, fullName, email, phone, extraPhone, jobTitleId } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId] : jobTitleId,
    };
  }
}
