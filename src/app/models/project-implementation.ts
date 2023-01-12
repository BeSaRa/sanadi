import {CaseModel} from "@app/models/case-model";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {InterceptModel} from "@decorators/intercept-model";
import {FactoryService} from "@services/factory.service";
import {ProjectImplementationInterceptor} from "@model-interceptors/project-implementation-interceptor";
import {CaseTypes} from "@app/enums/case-types.enum";
import {HasLicenseApprovalMonthly} from "@contracts/has-license-approval-monthly";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/mixin-approval-license-with-monthly";
import {mixinRequestType} from "@app/mixins/mixin-request-type";
import {HasRequestType} from "@app/interfaces/has-request-type";

const _Approval = mixinApprovalLicenseWithMonthly(mixinRequestType(CaseModel))
const {send, receive} = new ProjectImplementationInterceptor()

@InterceptModel({send, receive})
export class ProjectImplementation extends _Approval<ProjectImplementationService, ProjectImplementation> implements HasLicenseApprovalMonthly , HasRequestType {
  service: ProjectImplementationService;
  caseType = CaseTypes.PROJECT_IMPLEMENTATION
  constructor() {
    super();
    this.service = FactoryService.getService('ProjectImplementationService')
  }
}
