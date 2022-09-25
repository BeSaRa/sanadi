import { BaseModel } from '@app/models/base-model';
import { NpoDataService } from './../services/npo-data.service';
import { FactoryService } from './../services/factory.service';
import { INames } from './../interfaces/i-names';
import { LangService } from '@app/services/lang.service';
import { InterceptModel } from "@decorators/intercept-model";
import { JobTitleInterceptor } from "@app/model-interceptors/job-title-interceptor";
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { FounderMembers } from './founder-members';
import { NpoBankAccount } from './npo-bank-account';
import { NpoContactOfficer } from './npo-contact-officer';
import { RealBeneficiary } from './real-beneficiary';

const interceptor: JobTitleInterceptor = new JobTitleInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class NpoData extends BaseModel<NpoData, NpoDataService> {
  service: NpoDataService;
  langService: LangService;
  id!: number;
  unifiedEconomicRecord!: string;
  activityType!: number;
  establishmentDate!: string | IMyDateModel;
  registrationAuthority!: number;
  registrationDate!: string | IMyDateModel;
  registrationNumber!: string;
  disbandmentType!: number;
  disbandmentDate!: string | IMyDateModel;
  clearanceDate!: string | IMyDateModel;
  clearanceType!: number;
  clearanceName!: string;
  phone!: string;
  email!: string;
  fax!: string;
  hotline!: string;
  website!: string;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  facebook!: string;
  twitter!: string;
  instagram!: string;
  snapChat!: string;
  youTube!: string;
  contactOfficerList: NpoContactOfficer[] = [];
  founderList: FounderMembers[] = [];
  bankAccountList: NpoBankAccount[] = [];
  beneficiaryList: RealBeneficiary[] = [];
  activityTypeInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  clearanceInfo!: AdminResult;
  disbandmentInfo!: AdminResult;
  registrationAuthorityInfo!: AdminResult;
  constructor() {
    super();
    this.service = FactoryService.getService('NpoDataService');
    this.langService = FactoryService.getService('LangService');
  }
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
