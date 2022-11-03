import { NpoBankAccount } from './../models/npo-bank-account';
import { AdminResult } from './../models/admin-result';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

export class NpoBankInterceptor implements IModelInterceptor<NpoBankAccount> {
  send(model: Partial<NpoBankAccount>): Partial<NpoBankAccount> {
    delete model.bankInfo;
    delete model.currencyInfo;
    delete model.searchFields;
    return model;
  }

  receive(model: NpoBankAccount): NpoBankAccount {
    model.bankInfo && (model.bankInfo = AdminResult.createInstance(model.bankInfo));
    model.currencyInfo && (model.currencyInfo = AdminResult.createInstance(model.currencyInfo));
    return model;
  }
}
