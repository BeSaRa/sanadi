import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from "@app/helpers/date-utils";
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';

export class BankBranch extends SearchableCloneable<BankBranch> {
  fullName!: string;
  establishmentDate!: string;
  address!: string;
  email!: string;
  fax!: string;
  recordNo!: string;
  phone!: string;
  postalCode!: string;

  getBranchFields(control: boolean = false): any {
    const {
      fullName,
      establishmentDate,
      address,
      email,
      fax,
      recordNo,
      phone,
      postalCode
    } = this;

    return {
      fullName: control ? [fullName, [CustomValidators.required, CustomValidators.maxLength(100)]] : fullName,
      establishmentDate: control ? [DateUtils.changeDateToDatepicker(establishmentDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(establishmentDate),
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      address: control ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
      recordNo: control ? [recordNo, [CustomValidators.maxLength(20)]] : recordNo,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.number, CustomValidators.maxLength(15)]] : postalCode
    }
  }
  searchFields: ISearchFieldsMap<BankBranch> = {
    ...normalSearchFields(['fullName','establishmentDate','address','email','fax','recordNo','phone','postalCode'])
  };
}
