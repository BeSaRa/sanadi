import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {BankAccountExecutiveManagement} from "@models/bank-account-executive-management";

export class BankAccountExecutiveManagementInterceptor implements IModelInterceptor<BankAccountExecutiveManagement> {
  receive(model: BankAccountExecutiveManagement): BankAccountExecutiveManagement {
    return model;
  }

  send(model: Partial<BankAccountExecutiveManagement>): Partial<BankAccountExecutiveManagement> {
    BankAccountExecutiveManagementInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BankAccountExecutiveManagement>): void {
    delete model.langService;
    delete model.searchFields;
  }
}
