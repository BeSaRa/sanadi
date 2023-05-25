import {ControlValueLabelLangKey, ISearchFieldsMap} from './../types/types';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {LangService} from "@services/lang.service";
import {FactoryService} from "@services/factory.service";
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";

export class TransferFundsExecutiveManagement extends SearchableCloneable<TransferFundsExecutiveManagement> implements IAuditModelProperties<TransferFundsExecutiveManagement> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  nameLikePassport!: string;
  englishNameLikePassport!: string;
  jobTitle!: string;
  executiveNationality!: number;
  executiveIdentificationNumber!: string;
  executivephone1!: string;
  executivephone2!: string;
  passportNumber!: string;
  executiveNationalityInfo!: AdminResult;

  langService: LangService;
  searchFields: ISearchFieldsMap<TransferFundsExecutiveManagement> = {
    ...normalSearchFields(['nameLikePassport', 'englishNameLikePassport', 'jobTitle', 'executiveIdentificationNumber']),
    ...infoSearchFields(['executiveNationalityInfo'])
  }

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.nameLikePassport : this.englishNameLikePassport;
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      nameLikePassport: {langKey: 'name_in_local_language_like_passport', value: this.nameLikePassport},
      englishNameLikePassport: {langKey: 'name_in_English_language_like_passport', value: this.englishNameLikePassport},
      jobTitle: {langKey: 'job_title', value: this.jobTitle},
      executiveNationality: {langKey: 'lbl_nationality', value: this.executiveNationality},
      executiveIdentificationNumber: {langKey: 'national_id_number', value: this.executiveIdentificationNumber},
      passportNumber: {langKey: 'passport_number', value: this.passportNumber},
      executivephone1: {langKey: 'lbl_phone_1', value: this.executivephone1},
      executivephone2: {langKey: 'lbl_phone_2', value: this.executivephone2},
    };
  }

  buildForm(control: boolean = false) {
    const values = ObjectUtils.getControlValues<TransferFundsExecutiveManagement>(this.getValuesWithLabels())

    return {
      nameLikePassport: control ? [values.nameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.nameLikePassport,
      englishNameLikePassport: control ? [values.englishNameLikePassport, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.englishNameLikePassport,
      jobTitle: control ? [values.jobTitle, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.jobTitle,
      executiveNationality: control ? [values.executiveNationality, [CustomValidators.required]] : values.executiveNationality,
      executiveIdentificationNumber: control ? [values.executiveIdentificationNumber, [CustomValidators.required, CustomValidators.maxLength(20)]] : values.executiveIdentificationNumber,
      passportNumber: control ? [values.passportNumber, [CustomValidators.required, ...CustomValidators.commonValidations.passport]] : values.passportNumber,
      executivephone1: control ? [values.executivephone1, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.executivephone1,
      executivephone2: control ? [values.executivephone2, CustomValidators.commonValidations.phone] : values.executivephone2
    }
  }

  getAdminResultByProperty(property: keyof TransferFundsExecutiveManagement): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'executiveNationality':
        adminResultValue = this.executiveNationalityInfo;
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

  isEqual(record: TransferFundsExecutiveManagement): boolean {
    return this.executiveIdentificationNumber === record.executiveIdentificationNumber;
  }
}
