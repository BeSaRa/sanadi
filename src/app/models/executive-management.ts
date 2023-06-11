import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from './admin-result';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {CommonUtils} from '@helpers/common-utils';
import {ObjectUtils} from '@helpers/object-utils';
import {LangService} from "@services/lang.service";
import {FactoryService} from "@services/factory.service";

export class ExecutiveManagement extends SearchableCloneable<ExecutiveManagement> implements IAuditModelProperties<ExecutiveManagement> {
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  nationality!: number;
  passportNumber!: string;
  nationalityInfo!: AdminResult

  searchFields: ISearchFieldsMap<ExecutiveManagement> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'email', 'passportNumber'])
  };

  searchFieldsNoPassport: ISearchFieldsMap<ExecutiveManagement> = {
    ...infoSearchFields(['nationalityInfo']),
    ...normalSearchFields(['arabicName', 'englishName', 'email'])
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

  getAdminResultByProperty(property: keyof ExecutiveManagement): AdminResult {
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

  getManagerFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<ExecutiveManagement>(this.getValuesWithLabels());
    return {
      arabicName: control ? [values.arabicName, [CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.arabicName,
      englishName: control ? [values.englishName, [CustomValidators.required, CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]] : values.englishName,
      email: control ? [values.email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : values.email,
      jobTitle: control ? [values.jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : values.jobTitle,
      phone: control ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      nationality: control ? [values.nationality] : values.nationality,
      passportNumber: control ? [values.passportNumber, [...CustomValidators.commonValidations.passport]] : values.passportNumber
    }
  }

  getValuesWithLabels(hidePassport: boolean = false): { [key: string]: ControlValueLabelLangKey } {
    let valuesWithLabels: { [key: string]: ControlValueLabelLangKey } = {
      arabicName: {langKey: 'arabic_name', value: this.arabicName},
      englishName: {langKey: 'english_name', value: this.englishName},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_phone', value: this.phone},
      nationality: {langKey: 'lbl_nationality', value: this.nationality},
      jobTitle: {langKey: 'job_title', value: this.jobTitle},
      passportNumber: {langKey: 'passport_number', value: this.passportNumber},
    };
    if (hidePassport) {
      delete valuesWithLabels.passportNumber;
    }
    return valuesWithLabels;
  }

  isEqual(record: ExecutiveManagement): boolean {
    return this.arabicName === record.arabicName
    && this.englishName === record.englishName
    && this.email === record.email
    && this.phone === record.phone
    && this.nationality === record.nationality
    && this.jobTitle === record.jobTitle
    && this.passportNumber === record.passportNumber;
  }
}
