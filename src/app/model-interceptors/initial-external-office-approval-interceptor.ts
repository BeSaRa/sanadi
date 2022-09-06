import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InitialExternalOfficeApproval} from "@app/models/initial-external-office-approval";
import {AdminResult} from "@app/models/admin-result";
import {TaskDetails} from "@app/models/task-details";
import {CommonUtils} from '@app/helpers/common-utils';
import {isValidAdminResult} from '@app/helpers/utils';

export class InitialExternalOfficeApprovalInterceptor implements IModelInterceptor<InitialExternalOfficeApproval> {
  send(model: Partial<InitialExternalOfficeApproval>): Partial<InitialExternalOfficeApproval> {
    if (model.ignoreSendInterceptor) {
      InitialExternalOfficeApprovalInterceptor._deleteBeforeSend(model);
      return model;
    }
    model.region = CommonUtils.isValidValue(model.region) ? model.region : '';
    InitialExternalOfficeApprovalInterceptor._deleteBeforeSend(model);

    return model;
  }

  receive(model: InitialExternalOfficeApproval): InitialExternalOfficeApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);
    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.countryInfo = AdminResult.createInstance(isValidAdminResult(model.countryInfo) ? model.countryInfo : {});

    return model;
  }

  private static _deleteBeforeSend(model: Partial<InitialExternalOfficeApproval>): void {
    delete model.ignoreSendInterceptor;
    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.licenseStatusInfo;
    delete model.ouInfo;
    delete model.countryInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.deductionPercent;
    delete model.requestTypeInfo;
  }
}
