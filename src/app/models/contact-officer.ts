import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';
import {INames} from "@contracts/i-names";
import {LangService} from "@services/lang.service";
import {FactoryService} from "@services/factory.service";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";

export class ContactOfficer extends SearchableCloneable<ContactOfficer> implements IAuditModelProperties<ContactOfficer> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  phone!: string;
  mobileNo!: string;
  passportNumber!: string;
  itemId!:string;

  searchFields: ISearchFieldsMap<ContactOfficer> = {
    ...normalSearchFields(['arabicName', 'englishName', 'email', 'phone', 'passportNumber'])
  };

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }

  getAdminResultByProperty(property: keyof ContactOfficer): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: {langKey: 'arabic_name', value: this.arabicName},
      englishName: {langKey: 'english_name', value: this.englishName},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_phone', value: this.phone},
      passportNumber: {langKey: 'passport_number', value: this.passportNumber},
      mobileNo: {langKey: 'mobile_number', value: this.mobileNo},
      itemId: {langKey: {} as keyof ILanguageKeys, value: this.itemId},
    };
  }

  getContactOfficerFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<ContactOfficer>(this.getValuesWithLabels());
    return {
      arabicName: control ? [values.arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.arabicName,
      englishName: control ? [values.englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.englishName,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : values.email,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      mobileNo: control ? [values.mobileNo, CustomValidators.commonValidations.phone] : values.mobileNo,
      passportNumber: control ? [values.passportNumber, [...CustomValidators.commonValidations.passport]] : values.passportNumber,
      itemId: control ? [values.itemId, []] : values.itemId,
    };
  }

  isEqual(record: ContactOfficer): boolean {
    return this.arabicName === record.arabicName
      && this.englishName === record.englishName
      && this.email === record.email
      && this.phone === record.phone
      && this.mobileNo === record.mobileNo
      && this.passportNumber === record.passportNumber;
  }
}
