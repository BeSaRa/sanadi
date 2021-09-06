import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {BankAccount} from '@app/models/bank-account';

export class BankAccountInterceptor implements IModelInterceptor<BankAccount> {
  send(model: Partial<BankAccount>): Partial<BankAccount> {
    delete model.searchFields;
    return model;
  }

  receive(model: BankAccount): BankAccount {
    return model;
  }
}
