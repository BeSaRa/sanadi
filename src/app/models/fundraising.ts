import { CaseTypes } from "@app/enums/case-types.enum";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { HasLicenseApproval } from "@app/interfaces/has-license-approval";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinApprovalLicenseWithDuration } from "@app/mixins/mixin-approval-license-with-duration";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import {
  FundraisingApproveTaskPopupComponent
} from "@app/modules/services/fundraising-channel-licensing/popups/fundraising-approve-task-popup/fundraising-approve-task-popup.component";
import { DialogService } from "@app/services/dialog.service";
import { FactoryService } from "@app/services/factory.service";
import { FundraisingService } from "@app/services/fundraising.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { CaseModel } from "./case-model";
import { TaskDetails } from "./task-details";
import { InterceptModel } from "@decorators/intercept-model";
import { FundraisingInterceptor } from "@app/model-interceptors/fundraising-interceptor";

const _ApprovalLicense = mixinApprovalLicenseWithDuration(mixinRequestType(CaseModel));
const { send, receive } = new FundraisingInterceptor();

@InterceptModel({ send, receive })
export class Fundraising extends _ApprovalLicense<FundraisingService, Fundraising> implements HasLicenseApproval, HasRequestType {
  service: FundraisingService;
  id!: string;
  createdOn!: string;
  lastModified!: string;
  classDescription!: string;
  creatorInfo!: AdminResult;
  ouInfo!: AdminResult;
  serial!: number;
  fullSerial!: string;
  caseStatus!: number;
  caseType: number = CaseTypes.FUNDRAISING_LICENSING;
  organizationId!: number;
  taskDetails!: TaskDetails;
  caseStatusInfo!: AdminResult;
  about!: string;
  arName!: string;
  chiefDecision!: number;
  chiefJustification!: string;
  conditionalLicenseIndicator!: boolean;
  customTerms!: string;
  description!: string;
  enName!: string;
  exportedLicenseFullSerial!: string;
  exportedLicenseId!: string;
  exportedLicenseSerial!: number;
  followUpDate!: string;
  licenseDurationType!: number;
  licenseDuration!: number;
  licenseVSID!: string;
  licenseStatus!: number;
  licenseStartDate!: string;
  licenseApprovedDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  oldLicenseFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  publicTerms!: string;
  requestType!: number;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  inRenewalPeriod!: boolean;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  riskAssessment!: string;
  workingMechanism!: string;
  requestTypeInfo!: AdminResult;
  className!: string;

  dialog!: DialogService;
  searchFields: ISearchFieldsMap<Fundraising> = {
    ...normalSearchFields(['fullSerial', 'subject']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo', 'creatorInfo', 'caseStatusInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService("FundraisingService");
    this.dialog = FactoryService.getService("DialogService");
  }

  buildBasicInfo(controls: boolean = false): any {
    const {
      requestType,
      licenseDurationType,
      oldLicenseFullSerial,
      arName,
      enName,
      about,
      workingMechanism,
      riskAssessment,
    } = this;
    return {
      requestType: controls ? [requestType, [CustomValidators.required]] : requestType,
      licenseDurationType: controls ? [licenseDurationType, [CustomValidators.required]] : licenseDurationType,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]] : oldLicenseFullSerial,
      arName: controls ? [arName, [
        CustomValidators.required, CustomValidators.pattern("AR_ONLY"),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]
      ] : arName,
      enName: controls ? [enName, [
        CustomValidators.required, CustomValidators.pattern("ENG_ONLY"),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)],
      ] : enName,
      about: controls ? [about, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : about,
      workingMechanism: controls ? [workingMechanism, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : workingMechanism,
      riskAssessment: controls ? [riskAssessment, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : riskAssessment,
    };
  }

  buildExplanation(controls: boolean = false): any {
    const { description } = this;
    return {
      description: controls ? [description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description
    };
  }

  approve(): DialogRef {
    return this.dialog.show(FundraisingApproveTaskPopupComponent, {
      model: this,
      action: WFResponseType.APPROVE,
    });
  }

  finalApprove(): DialogRef {
    return this.dialog.show(FundraisingApproveTaskPopupComponent, {
      model: this,
      action: WFResponseType.FINAL_APPROVE,
    });
  }
}
