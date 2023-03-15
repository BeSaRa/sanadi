import { ServiceDataService } from '@services/service-data.service';
import { BaseModel } from './base-model';
import { searchFunctionType } from '../types/types';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';
import { LookupService } from '@services/lookup.service';
import { AdminResult } from './admin-result';
import { INames } from '@contracts/i-names';
import { CaseTypes } from '@app/enums/case-types.enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ServiceDataInterceptor } from "@app/model-interceptors/service-data-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const interceptor = new ServiceDataInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class ServiceData extends BaseModel<ServiceData, ServiceDataService> {
  caseType!: number;
  customSettings!: string;
  bawServiceCode!: string;
  requestSerialCode!: string;
  licenseSerialCode!: string;
  status: number = 1;
  statusDateModified: string | null = '';
  statusInfo!: AdminResult;
  statusDateModifiedString!: string;
  updatedOnString!: string;
  updatedByInfo!: AdminResult;
  serviceTerms: string = '';
  licenseMaxTime!: number;
  licenseMinTime!: number;
  serviceTimeLimit!: number;
  fees!: number;
  serviceDescription: string = '';
  serviceRequirements: string = '';
  serviceStepsArabic: string = '';
  serviceStepsEnglish: string = '';

  maxTargetAmount!: number;
  maxElementsCount!: number;
  activateDevelopmentField: boolean = false;
  attachmentID!: number;
  sLA!: number;
  serviceReviewLimit!: number;
  followUp!: boolean;

  concernedDepartmentsIds?:string;

  service: ServiceDataService;
  langService: LangService;
  lookupService: LookupService;
  searchFields: { [key: string]: searchFunctionType | string } = {
    bawServiceCode: 'bawServiceCode',
    arName: 'arName',
    enName: 'enName',
    updatedBy: text => this.updatedByInfo.getName().toLowerCase().indexOf(text) !== -1,
    updatedOn: text => this.updatedOnString.toLowerCase().indexOf(text) !== -1,
    status: text => this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ServiceDataService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  hasCustomSettings() {
    return this.caseType == CaseTypes.EXTERNAL_PROJECT_MODELS ||
      this.caseType == CaseTypes.URGENT_INTERVENTION_LICENSING ||
      this.caseType == CaseTypes.COLLECTOR_LICENSING ||
      this.caseType === CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE;
  }

  isExternalProjectModels() {
    return this.caseType == CaseTypes.EXTERNAL_PROJECT_MODELS;
  }

  isUrgentInterventionLicensing() {
    return this.caseType == CaseTypes.URGENT_INTERVENTION_LICENSING;
  }

  isCollectorLicensing() {
    return this.caseType == CaseTypes.COLLECTOR_LICENSING;
  }

  isCustomExemption() {
    return this.caseType == CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({ arName: this.arName, enName: this.enName, id: this.id, status: this.status, disabled: !this.isActive() });
  }
}
