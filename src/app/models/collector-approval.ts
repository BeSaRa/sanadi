import { CaseModel } from '@app/models/case-model';
import { CollectorApprovalService } from '@app/services/collector-approval.service';
import { FactoryService } from '@app/services/factory.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { AdminResult } from '@app/models/admin-result';
import { CollectorItem } from '@app/models/collector-item';
import { CustomValidators } from '@app/validators/custom-validators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { HasLicenseDurationType } from '@app/interfaces/has-license-duration-type';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { InterceptModel } from "@decorators/intercept-model";
import { CollectorApprovalInterceptor } from "@app/model-interceptors/collector-approval-interceptor";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const {send, receive} = new CollectorApprovalInterceptor()
@InterceptModel({send, receive})
export class CollectorApproval extends _RequestType<CollectorApprovalService, CollectorApproval> implements HasRequestType, HasLicenseDurationType,IAuditModelProperties<CollectorApproval>{
  serviceSteps: string[] = [];
  caseType: number = CaseTypes.COLLECTOR_LICENSING;
  organizationId!: number;
  chiefDecision!: number;
  chiefJustification!: string;
  description!: string;
  licenseStartDate!: string;
  licenseEndDate!: string;
  managerDecision!: number;
  managerJustification!: string;
  publicTerms!: string;
  reviewerDepartmentDecision!: number;
  reviewerDepartmentJustification!: string;
  secondSpecialistDecision!: number;
  secondSpecialistJustification!: string;
  specialistDecision!: number;
  specialistJustification!: string;
  subject!: string;
  inRenewalPeriod!: boolean;
  collectorItemList: CollectorItem[] = [];
  organizationInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  specialistDecisionInfo!: AdminResult;
  secondSpecialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  requestClassificationInfo!: AdminResult;
  licenseDurationTypeInfo!: AdminResult;
  organizationCode!: string;
  searchFields: ISearchFieldsMap<CollectorApproval> = {
    ...normalSearchFields(['fullSerial', 'subject']),
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['requestTypeInfo','caseStatusInfo', 'creatorInfo', 'ouInfo'])
  }

  service: CollectorApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('CollectorApprovalService');
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
      licenseDurationType:{langKey: 'request_type', value: this.licenseDurationType},
    };
  }
  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    };
  }
  buildBasicInfo(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<CollectorApproval>(this.getBasicInfoValuesWithLabels());

    return {
      requestType: controls ? [values.requestType, [CustomValidators.required]] :values.requestType,
      licenseDurationType: controls ? [values.licenseDurationType, [CustomValidators.required]] :values.licenseDurationType
    }
  }

  buildExplanation(controls: boolean = false): any {
    const values = ObjectUtils.getControlValues<CollectorApproval>(this.getExplanationValuesWithLabels());
    return {
      description: controls ? [values.description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
    }
  }

  approve(): DialogRef {
    return this.service.approveTask(this, WFResponseType.APPROVE);
  }

  finalApprove(): DialogRef {
    return this.service.approveTask(this, WFResponseType.FINAL_APPROVE);
  }

  hasInvalidCollectorItems(): boolean {
    return !this.collectorItemList.length || this.collectorItemList.some((item) => !item.hasValidApprovalInfo());
  }
  getAdminResultByProperty(property: keyof CollectorApproval): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
