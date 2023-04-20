import { AdminResult } from './admin-result';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';

export class NpoContactOfficer extends SearchableCloneable<NpoContactOfficer>{
  officerId!: number;
  identificationNumber!: string;
  fullName!: string;
  email!: string;
  phone!: string;
  extraPhone!: string;
  jobTitleId!: number;

  jobInfo!: AdminResult;

  getContactOfficerFields(control: boolean): any {
    const { identificationNumber, fullName, email, phone, extraPhone, jobTitleId } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
    };
  }

  searchFields: ISearchFieldsMap<NpoContactOfficer> = {
    ...normalSearchFields(['officerId','identificationNumber','fullName','email','phone','extraPhone','jobTitleId'])
  };
}
