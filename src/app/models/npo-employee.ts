import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { Lookup } from '@app/models/lookup';
import { AdminResult } from './admin-result';
import { NpoEmployeeInterceptor } from '@app/model-interceptors/npo-employee-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';

const { receive, send } = new NpoEmployeeInterceptor();
@InterceptModel({
  receive,
  send
})
export class NpoEmployee extends SearchableCloneable<NpoEmployee>{
  orgId!: number;
  getqId!: number;
  contractLocation!: string;
  arabicName!: string;
  englishName!: string;
  email!: string;
  jobTitle!: string;
  phone!: string;
  country!: number;
  status!: number;
  statusInfo!: AdminResult;

  statusDateModified!: string;
  id!: number;
  jobTitleId!: number;
  jobTitleInfo!: Lookup;
  qId!: number;
  identificationNumber!: number;
  nationality!: number;
  nationalityInfo!: AdminResult;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService?.map.lang == 'ar' ? this.arabicName : this.englishName;
  }
}
