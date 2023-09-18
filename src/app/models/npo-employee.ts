import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from './admin-result';
import {NpoEmployeeInterceptor} from '@app/model-interceptors/npo-employee-interceptor';
import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {BankAccountExecutiveManagement} from "@models/bank-account-executive-management";

const {receive, send} = new NpoEmployeeInterceptor();

@InterceptModel({
  receive,
  send
})
export class NpoEmployee extends SearchableCloneable<NpoEmployee> {
  orgId!: number;
  contractLocation!: number;
  arabicName!: string;
  englishName!: string;
  email!: string;
  phone!: string;
  country!: number;
  status!: number;
  contractLocationInfo!: AdminResult;
  statusInfo!: AdminResult;
  jobTitleName!: string;

  workStartDate!: string;
  statusDateModified!: string;
  id!: number;
  qId!: string;
  identificationNumber!: string;
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

  convertToBankAccountExecutiveManagement(): BankAccountExecutiveManagement {
    return new BankAccountExecutiveManagement().clone({
      id: this.id,
      arabicName: this.arabicName,
      englishName: this.englishName,
      identificationNumber: (this.identificationNumber ?? '') + '',
      jobTitle: this.jobTitleName
    })
  }
}
