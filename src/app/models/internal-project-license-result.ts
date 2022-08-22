import { BaseLicense } from '@app/models/base-license';
import { AdminResult } from '@app/models/admin-result';
import { InterceptModel } from "@decorators/intercept-model";
import {
  InternalProjectLicenseResultInterceptor
} from "@app/model-interceptors/internal-project-license-result-interceptor";

const { send, receive } = new InternalProjectLicenseResultInterceptor();
@InterceptModel({ send, receive })
export class InternalProjectLicenseResult extends BaseLicense {

  arName!: string;
  beneficiaries18to60!: number;
  caseStatusInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  domainInfo!: AdminResult;
  enName!: string;
  firstSDGoalInfo!: AdminResult;
  firstSubDomainInfo!: AdminResult;
  forceUpdateContent: boolean = false;
  fullSerial!: string;
  generalManagerDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  organizationId!: number;
  projectTypeInfo!: AdminResult;
  reviewerDepartmentDecisionInf!: AdminResult;
  secondSDGoalInfo!: AdminResult;
  secondSubDomainInfo!: AdminResult;
  serial!: number;
  specialistDecisionInfo!: AdminResult;
  targetNationalitiesInfo!: AdminResult[]
  thirdSDGoalInfo!: AdminResult;

}
