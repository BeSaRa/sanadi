import { AdminResult } from './admin-result';
import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';

export class FounderMembers extends SearchableCloneable<FounderMembers>{
  objectDBId!: number;
  identificationNumber!: string;
  fullName!: string;
  jobTitleId!: number;
  email!: string;
  phone!: string;
  extraPhone!: string;
  nationality!: number;
  jobTitleInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  getFounderMembersFields(control: boolean): any {
    const { identificationNumber,
      fullName,
      jobTitleId,
      email,
      phone,
      extraPhone,
      nationality } = this;

    return {
      identificationNumber: control ? [identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]] : identificationNumber,
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(300),
      CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : fullName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      extraPhone: control ? [extraPhone, CustomValidators.commonValidations.phone] : extraPhone,
      jobTitleId: control ? [jobTitleId, [CustomValidators.required]] : jobTitleId,
      nationality: control ? [nationality, [CustomValidators.required]] : nationality,
    };
  }
  searchFields: ISearchFieldsMap<FounderMembers> = {
    ...normalSearchFields(['objectDBId','identificationNumber', 'fullName', 'email', 'phone', 'extraPhone']),
    ...infoSearchFields(['jobTitleInfo','nationalityInfo'])
  };
}
