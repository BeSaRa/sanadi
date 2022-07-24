import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {AdminLookup} from '@app/models/admin-lookup';
import {AdminResult} from '@app/models/admin-result';

export class AdminLookupInterceptor implements IModelInterceptor<AdminLookup>{
  receive(model: AdminLookup): AdminLookup {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.parentInfo && (model.parentInfo = AdminResult.createInstance(model.parentInfo));
    model.typeInfo && (model.typeInfo = AdminResult.createInstance(model.typeInfo));
    return model;
  }

  send(model: Partial<AdminLookup>): Partial<AdminLookup> {
    AdminLookupInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static  _deleteBeforeSend(model: Partial<AdminLookup>): void {
    delete model.statusInfo;
    delete model.service;
    delete model.typeInfo;
    delete model.parentInfo;
    delete model.langService;
    delete model.searchFields;
    delete model.dacOchaSearchFields;
  }
}
