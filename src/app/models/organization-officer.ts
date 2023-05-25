import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {OrganizationOfficerInterceptor} from '@app/model-interceptors/organization-officer-interceptor';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {AdminResult} from './admin-result';
import {ObjectUtils} from "@helpers/object-utils";

const {receive, send} = new OrganizationOfficerInterceptor();

@InterceptModel({receive, send})
export class OrganizationOfficer extends SearchableCloneable<OrganizationOfficer> implements IAuditModelProperties<OrganizationOfficer> {
  qid!: string;
  organizationId!: number;
  fullName!: string;
  email!: string;
  phone!: string;
  identificationNumber!: string;
  extraPhone!: string;
  langService?: LangService;
  searchFields: ISearchFieldsMap<OrganizationOfficer> = {
    ...normalSearchFields(['fullName', 'identificationNumber', 'email', 'phone', 'extraPhone'])
  };
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }


  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      organizationId: {langKey: 'organization', value: this.organizationId},
      fullName: {langKey: 'full_name', value: this.fullName},
      email: {langKey: 'lbl_email', value: this.email},
      phone: {langKey: 'lbl_phone', value: this.phone},
      identificationNumber: {langKey: 'identification_number', value: this.identificationNumber},
      extraPhone: {langKey: 'lbl_extra_phone_number', value: this.extraPhone},
    };
  }

  getAdminResultByProperty(property: keyof OrganizationOfficer): AdminResult {
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

  buildForm(controls: boolean) {
    const values = ObjectUtils.getControlValues<OrganizationOfficer>(this.getValuesWithLabels());
    return {
      identificationNumber: controls ? [values.identificationNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : values.identificationNumber,
      fullName: controls ? [values.fullName, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.fullName,
      email: controls ? [values.email, [CustomValidators.required, CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : values.email,
      phone: controls ? [values.phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phone,
      extraPhone: controls ? [values.extraPhone, CustomValidators.commonValidations.phone] : values.extraPhone
    }
  }

  isEqual(record: OrganizationOfficer): boolean {
    return this.identificationNumber === record.identificationNumber;
  }
}
