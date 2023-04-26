import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { isValidAdminResult } from '@app/helpers/utils';
import { BankAccount } from '@app/models/bank-account';
import { BankBranch } from '@app/models/bank-branch';
import { ExecutiveManagement } from '@app/models/executive-management';
import { FactoryService } from '@app/services/factory.service';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { IMyDateModel } from 'angular-mydatepicker';
import { IModelInterceptor } from '../interfaces/i-model-interceptor';
import { AdminResult } from '../models/admin-result';
import { FinalExternalOfficeApproval } from '../models/final-external-office-approval';
import { TaskDetails } from '../models/task-details';

export class FinalExternalOfficeApprovalInterceptor implements IModelInterceptor<FinalExternalOfficeApproval> {

  receive(model: FinalExternalOfficeApproval): FinalExternalOfficeApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});

    model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo);
    model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo);
    model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo);
    model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo);
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo);

    let service = FactoryService.getService<FinalExternalOfficeApprovalService>('FinalExternalOfficeApprovalService');
    model.bankAccountList = model.bankAccountList.map(x => service.bankAccountInterceptor.receive(new BankAccount().clone(x)));
    model.executiveManagementList = model.executiveManagementList.map(x => service.executiveManagementInterceptor.receive(new ExecutiveManagement().clone(x)));
    model.branchList = model.branchList.map(x => service.bankBranchInterceptor.receive(new BankBranch().clone(x)));
    model.establishmentDateTimeStamp = !model.establishmentDate ? null : DateUtils.getTimeStampFromDate(model.establishmentDate);
    model.countriesInfo = model.countriesInfo.map(x=>AdminResult.createInstance(x))
    model.headQuarterTypeInfo = AdminResult.createInstance(model.headQuarterTypeInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.licenseDurationTypeInfo = AdminResult.createInstance(model.licenseDurationTypeInfo);
    return model;
  }

  send(model: Partial<FinalExternalOfficeApproval>): Partial<FinalExternalOfficeApproval> {
    if (model.ignoreSendInterceptor) {
      FinalExternalOfficeApprovalInterceptor._deleteBeforeSend(model);
      return model;
    }
    model.region = CommonUtils.isValidValue(model.region) ? model.region : '';
    model.establishmentDate = !model.establishmentDate ? undefined : DateUtils.changeDateFromDatepicker(model.establishmentDate as unknown as IMyDateModel)?.toISOString();

    let service = FactoryService.getService<FinalExternalOfficeApprovalService>('FinalExternalOfficeApprovalService');
    model.bankAccountList = model.bankAccountList?.map(x => {
      return service.bankAccountInterceptor.send(new BankAccount().clone(x)) as BankAccount;
    });
    model.executiveManagementList = model.executiveManagementList?.map(x => {
      return service.executiveManagementInterceptor.send(x) as ExecutiveManagement;
    });
    model.branchList = model.branchList?.map(x => {
      return service.bankBranchInterceptor.send(x) as BankBranch;
    });

    FinalExternalOfficeApprovalInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FinalExternalOfficeApproval>): void {
    delete model.ignoreSendInterceptor;
    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.requestTypeInfo;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.ouInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.deductionPercent;
    delete model.licenseStatusInfo;
    delete model.countriesInfo;
    delete model.countryInfo;
    delete model.licenseDurationTypeInfo;
    delete model.headQuarterTypeInfo;
  }

}
