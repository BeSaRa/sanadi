import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {TaskDetails} from '@app/models/task-details';
import {AdminResult} from '@app/models/admin-result';
import {BankAccount} from '@app/models/bank-account';
import {isValidAdminResult} from '@app/helpers/utils';
import {BankAccountRequestTypes} from '@app/enums/service-request-types';
import {BankAccountOperationTypes} from '@app/enums/bank-account-operation-types';
import {BankAccountExecutiveManagement} from "@models/bank-account-executive-management";
import {
  BankAccountExecutiveManagementInterceptor
} from "@model-interceptors/bank-account-executive-management.interceptor";

const bankAccountExecutiveManagementInterceptor = new BankAccountExecutiveManagementInterceptor();

export class InternalBankAccountApprovalInterceptor implements IModelInterceptor<InternalBankAccountApproval> {
  send(model: Partial<InternalBankAccountApproval>): Partial<InternalBankAccountApproval> {
    model.internalBankAccountDTOs = model.internalBankAccountDTOs?.map(ba => ({
      id: ba.id,
      accountNumber: ba.accountNumber,
      isMergeAccount: ba.isMergeAccount
    }) as unknown as BankAccount);
    model.bankAccountExecutiveManagementDTOs = (model.bankAccountExecutiveManagementDTOs ?? []).map(item => {
      return bankAccountExecutiveManagementInterceptor.send(item) as BankAccountExecutiveManagement
    });

    if (model.requestType === BankAccountRequestTypes.CANCEL) {
      model.operationType = BankAccountOperationTypes.INACTIVE;
    }
    InternalBankAccountApprovalInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: InternalBankAccountApproval): InternalBankAccountApproval {
    model.taskDetails = (new TaskDetails().clone(model.taskDetails));
    model.requestTypeInfo = isValidAdminResult(model.requestTypeInfo) ? AdminResult.createInstance(model.requestTypeInfo) : AdminResult.createInstance({});
    model.creatorInfo = isValidAdminResult(model.creatorInfo) ? AdminResult.createInstance(model.creatorInfo) : AdminResult.createInstance({});
    model.ouInfo = isValidAdminResult(model.ouInfo) ? AdminResult.createInstance(model.ouInfo) : AdminResult.createInstance({});
    model.caseStatusInfo = isValidAdminResult(model.caseStatusInfo) ? AdminResult.createInstance(model.caseStatusInfo) : AdminResult.createInstance({});
    model.operationTypeInfo = isValidAdminResult(model.operationTypeInfo) ? AdminResult.createInstance(model.operationTypeInfo) : AdminResult.createInstance({});
    model.bankCategoryInfo = isValidAdminResult(model.bankCategoryInfo) ? AdminResult.createInstance(model.bankCategoryInfo) : AdminResult.createInstance({});
    model.mainAccountInfo = isValidAdminResult(model.mainAccountInfo) ? AdminResult.createInstance(model.mainAccountInfo) : AdminResult.createInstance({});
    model.currencyInfo = isValidAdminResult(model.currencyInfo) ? AdminResult.createInstance(model.currencyInfo) : AdminResult.createInstance({});
    model.bankInfo = isValidAdminResult(model.bankInfo) ? AdminResult.createInstance(model.bankInfo) : AdminResult.createInstance({});
    model.bankCategoryInfo = isValidAdminResult(model.bankCategoryInfo) ? AdminResult.createInstance(model.bankCategoryInfo) : AdminResult.createInstance({});
    model.internalBankAccountDTOs = model.internalBankAccountDTOs || [];
    model.bankAccountExecutiveManagementDTOs = (model.bankAccountExecutiveManagementDTOs ?? []).map(x => {
      return new BankAccountExecutiveManagement().clone(x);
    });

    if (model.requestType === BankAccountRequestTypes.CANCEL) {
      model.operationType = undefined;
    }

    return model;
  }

  private static _deleteBeforeSend(model: Partial<InternalBankAccountApproval>): void {

    delete model.taskDetails;
    delete model.requestTypeInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.caseStatusInfo;
    delete model.operationTypeInfo;
    delete model.bankCategoryInfo;
    delete model.mainAccountInfo;
    delete model.currencyInfo;
    delete model.bankInfo;
    delete model.employeeService;
    delete model.service;
    delete model.searchFields;
    delete model.encrypt;
    delete model.selectedBankAccountToMerge;
    delete model.ownerOfMergedBankAccounts;
    delete model.selectedResponsiblePerson;
  }
}
