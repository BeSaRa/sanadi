import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {AdminResult} from "@app/models/admin-result";
import {BankAccount} from '@app/models/bank-account';
import {Lookup} from '@models/lookup';

export class BankAccountInterceptor implements IModelInterceptor<BankAccount> {
  send(model: Partial<BankAccount>): Partial<BankAccount> {
    BankAccountInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: BankAccount): BankAccount {
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.currencyInfo = AdminResult.createInstance(model.currencyInfo);
    model.bankCategoryInfo = new Lookup().clone(model.bankCategoryInfo);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BankAccount>): void {
    delete model.searchFields;
    delete model.countryInfo;
    delete model.currencyInfo;
    delete model.auditOperation;
    delete model.bankCategoryInfo;
  }
}
