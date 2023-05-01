import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { OrganizationOfficerInterceptor } from '@app/model-interceptors/organization-officer-interceptor';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';
import { AdminResult } from './admin-result';

const { receive, send } = new OrganizationOfficerInterceptor();

@InterceptModel({ receive, send })
export class OrganizationOfficer extends SearchableCloneable<OrganizationOfficer> implements IAuditModelProperties<OrganizationOfficer>{
  qid!: string;
  organizationId!: number;
  fullName!: string;
  email!: string;
  phone!: string;
  identificationNumber!: string;
  extraPhone!: string;
  langService?: LangService;
  searchFields: ISearchFieldsMap<OrganizationOfficer> = {
    ...normalSearchFields(['fullName'])
  };
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getAdminResultByProperty(property: keyof OrganizationOfficer): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      organizationId: { langKey: 'organization', value: this.organizationId },
      fullName: { langKey: 'full_name', value: this.fullName },
      email: { langKey: 'lbl_email', value: this.email },
      phone: { langKey: 'lbl_phone', value: this.phone },
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      extraPhone: { langKey: 'lbl_extra_phone_number', value: this.extraPhone },
    };
  }
}
