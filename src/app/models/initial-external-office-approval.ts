import {InitialExternalOfficeApprovalService} from "@app/services/initial-external-office-approval.service";
import {FactoryService} from "@app/services/factory.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {AdminResult} from "@app/models/admin-result";
import {CaseTypes} from '@app/enums/case-types.enum';
import {ISearchFieldsMap} from "@app/types/types";
import {dateSearchFields} from "@app/helpers/date-search-fields";
import {infoSearchFields} from "@app/helpers/info-search-fields";
import {normalSearchFields} from "@app/helpers/normal-search-fields";

// noinspection JSUnusedGlobalSymbols
export class InitialExternalOfficeApproval extends LicenseApprovalModel<InitialExternalOfficeApprovalService, InitialExternalOfficeApproval> {
  caseType: number = CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL;
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
  licenseStatusInfo!: AdminResult;
  countryInfo!: AdminResult;

  // properties to be deleted while send to the backend
  service: InitialExternalOfficeApprovalService;
  searchFields: ISearchFieldsMap<InitialExternalOfficeApproval> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'caseStatusInfo', 'ouInfo']),
    ...normalSearchFields(['subject', 'fullSerial'])
  }

  constructor() {
    super();
    this.service = FactoryService.getService('InitialExternalOfficeApprovalService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  buildForm(controls?: boolean): any {
    const {
      requestType,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
      country,
      region,
      description,
      organizationId
    } = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      organizationId: controls ? [organizationId, [CustomValidators.required]] : organizationId,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      oldLicenseId: controls ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: controls ? [oldLicenseSerial] : oldLicenseSerial,
      country: controls ? [country, [CustomValidators.required]] : country,
      region: controls ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]] : region,
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    }
  }
}
