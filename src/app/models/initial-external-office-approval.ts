import {InitialExternalOfficeApprovalService} from "@app/services/initial-external-office-approval.service";
import {FactoryService} from "@app/services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {AdminResult} from "@app/models/admin-result";

// noinspection JSUnusedGlobalSymbols
export class InitialExternalOfficeApproval extends LicenseApprovalModel<InitialExternalOfficeApprovalService, InitialExternalOfficeApproval> {
  caseType: number = 6;
  organizationId!: number
  subject!: string;
  requestType!: number;
  country!: number;
  region!: string;
  description!: string;
  specialistJustification!: string;
  chiefJustification!: string;
  managerJustification!: string;
  generalManagerJustification!: string;
  reviewerDepartmentJustification!: string;
  specialistDecision!: number;
  chiefDecision!: number;
  managerDecision!: number;
  generalManagerDecision!: number;
  reviewerDepartmentDecision!: number;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  generalManagerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;

  // properties to be delete while send to the backend
  service: InitialExternalOfficeApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('InitialExternalOfficeApprovalService')
  }

  buildForm(controls?: boolean): any {
    const {requestType, licenseNumber, country, region, description, organizationId} = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      organizationId: controls ? [organizationId, [CustomValidators.required]] : organizationId,
      licenseNumber: controls ? [licenseNumber, []] : licenseNumber,
      country: controls ? [country, [CustomValidators.required]] : country,
      region: controls ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]] : region,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(1200)]] : description,
    }
  }
}
