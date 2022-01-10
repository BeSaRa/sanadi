import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {AdminResult} from "@app/models/admin-result";
import {FinalExternalOfficeApprovalResult} from '@app/models/final-external-office-approval-result';
import {FactoryService} from '@app/services/factory.service';
import {FinalExternalOfficeApprovalService} from '@app/services/final-external-office-approval.service';
import {BankAccount} from '@app/models/bank-account';
import {BankBranch} from '@app/models/bank-branch';
import {ExecutiveManagement} from '@app/models/executive-management';

export class FinalExternalOfficeApprovalResultInterceptor implements IModelInterceptor<FinalExternalOfficeApprovalResult> {
  receive(model: FinalExternalOfficeApprovalResult): FinalExternalOfficeApprovalResult {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    // model.regionInfo = AdminResult.createInstance(model.regionInfo);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);

    let service = FactoryService.getService<FinalExternalOfficeApprovalService>('FinalExternalOfficeApprovalService');
    model.bankAccountList = model.bankAccountList.map(x => service.bankAccountInterceptor.receive(new BankAccount().clone(x)));
    model.executiveManagementList = model.executiveManagementList.map(x => service.executiveManagementInterceptor.receive(new ExecutiveManagement().clone(x)));
    model.branchList = model.branchList.map(x => service.bankBranchInterceptor.receive(new BankBranch().clone(x)));

    return model;
  }

  send(model: Partial<FinalExternalOfficeApprovalResult>): Partial<FinalExternalOfficeApprovalResult> {
    delete model.countryInfo;
    delete model.licenseStatusInfo;
    delete model.ouInfo;
    delete model.creatorInfo;
    // delete model.regionInfo;
    delete model.caseStatusInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.requestTypeInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.specialistDecisionInfo;
    return model;
  }
}
