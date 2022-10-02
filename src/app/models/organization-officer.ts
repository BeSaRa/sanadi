import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { OrganizationOfficerInterceptor } from '@app/model-interceptors/organization-officer-interceptor';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';

const { receive, send } = new OrganizationOfficerInterceptor();

@InterceptModel({ receive, send })
export class OrganizationOfficer extends SearchableCloneable<OrganizationOfficer>{
  qid!: string;
  organizationId!: number;
  fullName!: string;
  email!: string;
  phone!: string;
  identificationNumber!: string;
  extraPhone!: string;
  langService?: LangService;
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }
}
