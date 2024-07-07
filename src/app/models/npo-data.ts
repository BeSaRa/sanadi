import { Profile } from '@app/models/profile';
import { NpoDataInterceptor } from './../model-interceptors/npo-data-interceptor';
import { BaseModel } from '@app/models/base-model';
import { NpoDataService } from './../services/npo-data.service';
import { FactoryService } from './../services/factory.service';
import { INames } from './../interfaces/i-names';
import { LangService } from '@app/services/lang.service';
import { InterceptModel } from "@decorators/intercept-model";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { AdminResult } from './admin-result';
import { FounderMembers } from './founder-members';
import { NpoBankAccount } from './npo-bank-account';
import { NpoContactOfficer } from './npo-contact-officer';
import { RealBeneficiary } from './real-beneficiary';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';
import { EmployeeService } from '@app/services/employee.service';

const interceptor: NpoDataInterceptor = new NpoDataInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class NpoData extends BaseModel<NpoData, NpoDataService> {
  service: NpoDataService;
  langService: LangService;
  employeeService! :EmployeeService ;
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
  profileId!: number;
  status!:number;
  contactOfficerList: NpoContactOfficer[] = [];
  founderList: FounderMembers[] = [];
  bankAccountList: NpoBankAccount[] = [];
  beneficiaryList: RealBeneficiary[] = [];
  profileInfo!: Profile;
  activityTypeInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  clearanceInfo!: AdminResult;
  disbandmentInfo!: AdminResult;
  registrationAuthorityInfo!: AdminResult;
  statusInfo!: AdminResult;
  establishmentDateString!: string;
  registrationDateString!: string;


  constructor() {
    super();
    this.service = FactoryService.getService('NpoDataService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
  }
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
  searchFields: ISearchFieldsMap<NpoData> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['statusInfo'])
  };
  buildForm(controls?:boolean){
    const {
      arName,
      enName,
      registrationAuthority,
      unifiedEconomicRecord,
      activityType,
      registrationNumber

    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')]] : enName,
      unifiedEconomicRecord: controls ? [unifiedEconomicRecord, [Validators.required, Validators.maxLength(150)]] : unifiedEconomicRecord,
      activityType: controls ? [activityType, [Validators.required]] : activityType,
      registrationNumber: controls ? [registrationNumber, []] : registrationNumber,
      registrationAuthority: controls ? [registrationAuthority, []] : registrationAuthority,
    };
  }
  get canView():boolean{
    return this.employeeService.isInternalUser() || this.employeeService.getProfile()?.id === this.profileId
    }
}
