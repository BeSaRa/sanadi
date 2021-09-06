import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Consultation} from '../models/consultation';
import {TaskDetails} from '../models/task-details';
import {AdminResult} from '../models/admin-result';
import {FinalExternalOfficeApproval} from '../models/final-external-office-approval';
import {BankAccount} from '@app/models/bank-account';
import {InitialExternalOfficeApproval} from '@app/models/initial-external-office-approval';
import {BankAccountInterceptor} from '@app/model-interceptors/bank-account-interceptor';
import {BankBranchInterceptor} from '@app/model-interceptors/bank-branch-interceptor';
import {ExecutiveManagementInterceptor} from '@app/model-interceptors/executive-management-interceptor';
import {ExecutiveManagement} from '@app/models/executive-management';
import {BankBranch} from '@app/models/bank-branch';
import {FactoryService} from '@app/services/factory.service';
import {FinalExternalOfficeApprovalService} from '@app/services/final-external-office-approval.service';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from 'angular-mydatepicker';

export class FinalExternalOfficeApprovalInterceptor implements IModelInterceptor<FinalExternalOfficeApproval> {

  receive(model: FinalExternalOfficeApproval): FinalExternalOfficeApproval {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    // model.organizationInfo = AdminResult.createInstance(model.organizationInfo);

    let service = FactoryService.getService<FinalExternalOfficeApprovalService>('FinalExternalOfficeApprovalService');
    model.bankAccountList = model.bankAccountList.map(x => service.bankAccountInterceptor.receive(x));
    model.executiveManagementList = model.executiveManagementList.map(x => service.executiveManagementInterceptor.receive(x));
    model.branchList = model.branchList.map(x => service.bankBranchInterceptor.receive(x));
    return model;
  }

  send(model: Partial<FinalExternalOfficeApproval>): Partial<FinalExternalOfficeApproval> {
    model.establishmentDate = !model.establishmentDate ? '' : DateUtils.changeDateFromDatepicker(model.establishmentDate as unknown as IMyDateModel)?.toISOString();

    let service = FactoryService.getService<FinalExternalOfficeApprovalService>('FinalExternalOfficeApprovalService');
    model.bankAccountList = model.bankAccountList?.map(x => {
      return service.bankAccountInterceptor.send(x) as BankAccount;
    });
    model.executiveManagementList = model.executiveManagementList?.map(x => {
      return service.executiveManagementInterceptor.send(x) as ExecutiveManagement;
    });
    model.branchList = model.branchList?.map(x => {
      return service.bankBranchInterceptor.send(x) as BankBranch;
    });

    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.ouInfo;
    // delete model.organizationInfo;
    return model;
  }

}
