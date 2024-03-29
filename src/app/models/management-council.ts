import {normalSearchFields} from '@helpers/normal-search-fields';
import {AdminResult} from './admin-result';
import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';
import {LangService} from "@services/lang.service";
import {FactoryService} from "@services/factory.service";

export class ManagementCouncil extends SearchableCloneable<ManagementCouncil> implements IAuditModelProperties<ManagementCouncil> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  // mobileNo!: string;
  nationality!: number;
  passportNumber!: string;
  identificationNumber!: string;
  nationalityInfo!: AdminResult
  itemId!:string;

  searchFields: ISearchFieldsMap<ManagementCouncil> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'identificationNumber', 'passportNumber'])
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

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof ManagementCouncil): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'nationality':
        adminResultValue = this.nationalityInfo;
        break;
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
      identificationNumber: {langKey: 'national_id_number', value: this.identificationNumber},
      englishName: {langKey: 'english_name', value: this.englishName},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_phone', value: this.phone},
      nationality: {langKey: 'lbl_nationality', value: this.nationality},
      jobTitle: {langKey: 'job_title', value: this.jobTitle},
      passportNumber: {langKey: 'passport_number', value: this.passportNumber},
    };
  }

  getManagementCouncilFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<ManagementCouncil>(this.getValuesWithLabels());

    return {
      identificationNumber: control ? [values.identificationNumber, [CustomValidators.number]] : values.identificationNumber,
      // arabicName: control ? [values.arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
      //   CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
      //   CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.arabicName,
      englishName: control ? [values.englishName, [CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.englishName,
      //email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : values.email,
      jobTitle: control ? [values.jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : values.jobTitle,
      //phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      // mobileNo: control ? [mobileNo, [CustomValidators.required].concat(CustomValidators.commonValidations.mobileNo)] : mobileNo,
      nationality: control ? [values.nationality, CustomValidators.required] : values.nationality,
      passportNumber: control ? [values.passportNumber, [...CustomValidators.commonValidations.passport]] : values.passportNumber
    };
  }

  isEqual(record: ManagementCouncil): boolean {
    return this.arabicName === record.arabicName
      && this.englishName === record.englishName
      && this.email === record.email
      && this.phone === record.phone
      && this.nationality === record.nationality
      && this.passportNumber === record.passportNumber
      && this.jobTitle === record.jobTitle;
  }
}
