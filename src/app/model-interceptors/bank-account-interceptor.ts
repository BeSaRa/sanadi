import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import {BankAccount} from '@app/models/bank-account';

export class BankAccountInterceptor implements IModelInterceptor<BankAccount> {
  send(model: Partial<BankAccount>): Partial<BankAccount> {
    delete model.searchFields;
    delete model.countryInfo;
    delete model.currencyInfo;
    delete model.bankCategoryInfo;
    return model;
  }

  receive(model: BankAccount): BankAccount {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    return model;
  }
}
