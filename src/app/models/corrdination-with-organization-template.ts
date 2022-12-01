import { CoordinationWithOrganizationTemplateInterceptor } from './../model-interceptors/coordination-with-organization-template-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { SearchableCloneable } from './searchable-cloneable';

const { send, receive } = new CoordinationWithOrganizationTemplateInterceptor();

@InterceptModel({ send, receive })
export class CoordinationWithOrganizationTemplate extends SearchableCloneable<CoordinationWithOrganizationTemplate> {
  organizationId!: number | undefined;
  template!: string;
  templateId!: number;
  langService?: LangService;

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
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  get DisplayedColumns(): string[] {
    return [
      'actions',
    ];
  }
}
