import {AdminResult} from '@app/models/admin-result';
import {ImplementationTemplate} from '@app/models/implementation-template';
import {FundingSource} from '@app/models/funding-source';
import {Payment} from '@app/models/payment';
import {ExternalProjectImplementationService} from '@app/services/external-project-implementation.service';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {CaseTypes} from '@app/enums/case-types.enum';

export class ExternalProjectImplementation extends LicenseApprovalModel<ExternalProjectImplementationService, ExternalProjectImplementation> {
  serviceSteps: string[] = []
  caseType: number = CaseTypes.EXTERNAL_PROJECT_IMPLEMENTATION;
  organizationId!: number;
  licenseVSID!: string;
  licenseStatusInfo!: AdminResult;
  subject!: string;
  implementingAgencyType!: number;
  chiefDecision?: number;
  chiefJustification: string = '';
  implementingAgencyIds: string[] = [];
  projectEvaluationSLA!: number;
  description!: string;
  domain!: number;
  generalManagerDecision?: number;
  generalManagerJustification: string = '';
  requestedLicenseDuration!: number;
  requestedLicenseEndDate!: string;
  requestedLicenseStartDate!: string;
  mainDACCategory!: number;
  mainUNOCHACategory!: number;
  managerDecision?: number;
  managerJustification: string = '';
  projectLicenseFullSerial!: string;
  projectLicenseSerial!: number;
  projectLicenseId!: string;
  projectTotalCost!: number;
  remainingAmount!: number;
  fundingTotalCost!: number;
  paymentTotalCost!: number;
  country!: number;
  specialistDecision?: number;
  specialistJustification: string = '';
  implementationTemplate: ImplementationTemplate[] = [];
  fundingSources: FundingSource[] = [];
  payment: Payment[] = [];
  implementingAgencyInfo: AdminResult[] = [];
  chiefDecisionInfo!: AdminResult;
  countryInfo!: AdminResult;
  domainInfo!: AdminResult;
  generalManagerDecisionInfo!: AdminResult;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategoryInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  implementingAgencyTypeInfo!: AdminResult;
  inRenewalPeriod!: boolean
  usedInProjectCompletion!: boolean;

  service: ExternalProjectImplementationService;

  constructor() {
    super();
    this.service = FactoryService.getService('ExternalProjectImplementationService');
    this.finalizeSearchFields();
  }


  searchFields: ISearchFieldsMap<ExternalProjectImplementation> = {}

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

}
