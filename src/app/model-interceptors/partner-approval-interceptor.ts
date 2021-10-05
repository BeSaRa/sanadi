import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {TaskDetails} from '../models/task-details';
import {AdminResult} from '../models/admin-result';
import {PartnerApproval} from "../models/partner-approval";
import {FactoryService} from "@app/services/factory.service";
import {PartnerApprovalService} from "@app/services/partner-approval.service";
import {DateUtils} from "@app/helpers/date-utils";
import {IMyDateModel} from "angular-mydatepicker";
import {BankAccount} from "@app/models/bank-account";
import {ExecutiveManagement} from "@app/models/executive-management";
import {Goal} from "@app/models/goal";
import {ManagementCouncil} from "@app/models/management-council";
import {TargetGroup} from "@app/models/target-group";
import {ContactOfficer} from "@app/models/contact-officer";
import {ApprovalReason} from "@app/models/approval-reason";

export class PartnerApprovalInterceptor implements IModelInterceptor<PartnerApproval> {
  receive(model: PartnerApproval): PartnerApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.requestClassificationInfo = AdminResult.createInstance(model.requestClassificationInfo);

    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);

    // model.organizationInfo = AdminResult.createInstance(model.organizationInfo);
    let service = FactoryService.getService<PartnerApprovalService>('PartnerApprovalService');
    model.bankAccountList = model.bankAccountList.map(x => service.bankAccountInterceptor.receive(new BankAccount().clone(x)));
    model.goalsList = model.goalsList.map(x => service.goalInterceptor.receive(new Goal().clone(x)));
    model.managementCouncilList = model.managementCouncilList.map(x => service.managementCouncilInterceptor.receive(new ManagementCouncil().clone(x)));
    model.executiveManagementList = model.executiveManagementList.map(x => service.executiveManagementInterceptor.receive(new ExecutiveManagement().clone(x)));
    model.targetGroupList = model.targetGroupList.map(x => service.targetGroupInterceptor.receive(new TargetGroup().clone(x)));
    model.contactOfficerList = model.contactOfficerList.map(x => service.contactOfficerInterceptor.receive(new ContactOfficer().clone(x)));
    model.approvalReasonList = model.approvalReasonList.map(x => service.approvalReasonInterceptor.receive(new ApprovalReason().clone(x)));

    return model;
  }

  send(model: Partial<PartnerApproval>): Partial<PartnerApproval> {
    model.establishmentDate = !model.establishmentDate ? '' : DateUtils.changeDateFromDatepicker(model.establishmentDate as unknown as IMyDateModel)?.toISOString();

    let service = FactoryService.getService<PartnerApprovalService>('PartnerApprovalService');
    model.bankAccountList = model.bankAccountList?.map((x: BankAccount) => {
      return service.bankAccountInterceptor.send(x) as BankAccount;
    });
    model.goalsList = model.goalsList?.map((x: Goal) => {
      return service.goalInterceptor.send(x) as Goal;
    });
    model.managementCouncilList = model.managementCouncilList?.map((x: ManagementCouncil) => {
      return service.managementCouncilInterceptor.send(x) as ManagementCouncil;
    });
    model.executiveManagementList = model.executiveManagementList?.map((x: ExecutiveManagement) => {
      return service.executiveManagementInterceptor.send(x) as ExecutiveManagement;
    });
    model.targetGroupList = model.targetGroupList?.map((x: TargetGroup) => {
      return service.targetGroupInterceptor.send(x) as TargetGroup;
    });
    model.contactOfficerList = model.contactOfficerList?.map((x: ContactOfficer) => {
      return service.contactOfficerInterceptor.send(x) as ContactOfficer;
    });
    model.approvalReasonList = model.approvalReasonList?.map((x: ApprovalReason) => {
      return service.approvalReasonInterceptor.send(x) as ApprovalReason;
    });

    delete model.service;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.employeeService;

    delete model.countryInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.requestClassificationInfo;
    delete model.categoryInfo;
    delete model.searchFields;

    return model;
  }

}
