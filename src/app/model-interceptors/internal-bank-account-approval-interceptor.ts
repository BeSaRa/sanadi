import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {TaskDetails} from '@app/models/task-details';
import {AdminResult} from '@app/models/admin-result';
import {BankAccount} from '@app/models/bank-account';

export class InternalBankAccountApprovalInterceptor implements IModelInterceptor<InternalBankAccountApproval> {
  send(model: Partial<InternalBankAccountApproval>): Partial<InternalBankAccountApproval> {
    model.internalBankAccountDTO = model.internalBankAccountDTO?.map(ba => (new BankAccount())
      .clone({id: ba.id, accountNumber: ba.accountNumber}));

    delete model.taskDetails;
    delete model.requestTypeInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.caseStatusInfo;
    delete model.operationTypeInfo;
    delete model.bankCategoryInfo;
    delete model.mainAccountInfo;
    delete model.currencyInfo;

    return model;
  }

  receive(model: InternalBankAccountApproval): InternalBankAccountApproval {
    model.taskDetails = (new TaskDetails().clone(model.taskDetails));
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.operationTypeInfo = AdminResult.createInstance(model.operationTypeInfo);
    model.bankCategoryInfo = AdminResult.createInstance(model.bankCategoryInfo);
    model.mainAccountInfo = AdminResult.createInstance(model.mainAccountInfo);
    model.currencyInfo = AdminResult.createInstance(model.currencyInfo);

    return model;
  }
}
