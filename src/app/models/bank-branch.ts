import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {CustomValidators} from '@app/validators/custom-validators';

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
      fullName: control ? [fullName, [CustomValidators.required]] : fullName,
      establishmentDate: control ? [establishmentDate, [CustomValidators.required]] : establishmentDate,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      address: control ? [address, [CustomValidators.required]] : address,
      recordNo: control ? [recordNo, [CustomValidators.required]] : recordNo,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.number]] : postalCode
    }
  }
}
