import { CustomValidators } from "@app/validators/custom-validators";
import { SearchableCloneable } from "@app/models/searchable-cloneable";
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';

export class ContactOfficer extends SearchableCloneable<ContactOfficer> implements IAuditModelProperties<ContactOfficer> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  phone!: string;
  mobileNo!: string;
  passportNumber!: string;

  searchFields: ISearchFieldsMap<ContactOfficer> = {
    ...normalSearchFields(['arabicName', 'englishName', 'email', 'phone', 'passportNumber'])
  };

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getAdminResultByProperty(property: keyof ContactOfficer): AdminResult {
    return AdminResult.createInstance({});
  }

  getContactOfficerFields(control: boolean): any {
    const { arabicName, englishName, email, phone, mobileNo, passportNumber } = this;

    return {
      arabicName: control ? [arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : arabicName,
      englishName: control ? [englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : englishName,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      mobileNo: control ? [mobileNo, CustomValidators.commonValidations.phone] : mobileNo,
      passportNumber: control ? [passportNumber, [...CustomValidators.commonValidations.passport]] : passportNumber,
    };
  }
}
