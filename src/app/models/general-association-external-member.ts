import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {CustomValidators} from "@app/validators/custom-validators";
import {ObjectUtils} from "@helpers/object-utils";
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";

export class GeneralAssociationExternalMember extends SearchableCloneable<GeneralAssociationExternalMember> implements IAuditModelProperties<GeneralAssociationExternalMember> {
  id?: number;
  arabicName!: string;
  englishName!: string;
  jobTitleId!: number;
  identificationNumber!: number;
  jobTitleInfo!: AdminResult;
  langService!: LangService;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<GeneralAssociationExternalMember> = {
    ...normalSearchFields(['arabicName', 'englishName', 'identificationNumber'])
  }
  searchFieldsGeneralAssociation: ISearchFieldsMap<GeneralAssociationExternalMember> = {
    ...normalSearchFields(['arabicName', 'englishName', 'identificationNumber']),
    ...infoSearchFields(['jobTitleInfo'])
  }

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof GeneralAssociationExternalMember): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'jobTitleId':
        adminResultValue = this.jobTitleInfo;
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

  getValuesWithLabels(isGeneralAssociationMembers: boolean): { [key: string]: ControlValueLabelLangKey } {
    let response: { [key: string]: ControlValueLabelLangKey } = {
      // id: {langKey: 'id_number', value: this.id, skipAuditComparison: true},
      arabicName: {langKey: 'arabic_name', value: this.arabicName},
      englishName: {langKey: 'english_name', value: this.englishName},
      identificationNumber: {langKey: 'identification_number', value: this.identificationNumber}
    }
    if (isGeneralAssociationMembers) {
      response.jobTitleId = {langKey: 'job_title', value: this.jobTitleId};
    }
    return response;
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }

  buildForm(control: boolean, isGeneralAssociationMembers: boolean) {
    const values = ObjectUtils.getControlValues<GeneralAssociationExternalMember>(this.getValuesWithLabels(isGeneralAssociationMembers));
    const requiredValidator = isGeneralAssociationMembers ? [CustomValidators.required] : [];
    let formData: any = {
      arabicName: control ? [values.arabicName, requiredValidator.concat([
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.pattern('AR_NUM')]
      )] : values.arabicName,
      englishName: control ? [values.englishName, requiredValidator.concat([
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.pattern('ENG_NUM')]
      )] : values.englishName,
      identificationNumber: control ? [values.identificationNumber, requiredValidator.concat(CustomValidators.commonValidations.qId)] : values.identificationNumber
    }
    if (isGeneralAssociationMembers) {
      formData.jobTitleId = control ? [values.jobTitleId, requiredValidator] : values.jobTitleId
    }
    return formData;
  }

  isEqual(record: GeneralAssociationExternalMember): boolean {
    return this.identificationNumber === record.identificationNumber;
  }
}
