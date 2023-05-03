import { TemplateField } from './template-field';
import { CoordinationWithOrganizationTemplateInterceptor } from './../model-interceptors/coordination-with-organization-template-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { SearchableCloneable } from './searchable-cloneable';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminResult } from './admin-result';
import { IHasParsedTemplates } from '@app/interfaces/i-has-parsed-templates';

const { send, receive } = new CoordinationWithOrganizationTemplateInterceptor();

@InterceptModel({ send, receive })
export class CoordinationWithOrganizationTemplate extends SearchableCloneable<CoordinationWithOrganizationTemplate> implements IHasParsedTemplates,IAuditModelProperties<CoordinationWithOrganizationTemplate> {
  id!: number | undefined;
  profileId!: number | undefined;
  template!: string;
  templateId!: number;
  langService?: LangService;
  parsedTemplates:TemplateField[]=[];

  generatedTemplate: TemplateField[] = [];
  constructor() {
    super();
    this.employeeService = FactoryService.getService('EmployeeService');
    this.langService = FactoryService.getService('LangService');
  }

  employeeService: EmployeeService;
  searchFields: ISearchFieldsMap<CoordinationWithOrganizationTemplate> = {
    ...infoSearchFields([]),
    ...normalSearchFields([]),
  };
  getAdminResultByProperty(property: keyof CoordinationWithOrganizationTemplate): AdminResult {
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
      templateId: { langKey: 'lbl_template', value: this.templateId },
      profileId: { langKey: 'lbl_profile', value: this.profileId },
      template: { langKey: 'lbl_template', value: this.template },
    };
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.profileId;
      delete this.searchFields.organization;
    }
  }
}
