import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CustomRole} from '@app/models/custom-role';

export class CustomRoleInterceptor implements IModelInterceptor<CustomRole> {
  receive(model: CustomRole): any {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == (model.status ? 1 : 0))!);
    return model;
  }

  send(model: CustomRole): any {
    CustomRoleInterceptor._deleteBeforeSend(model);
    return model
  }

  private static _deleteBeforeSend(model: Partial<CustomRole>): void {
    delete model.service;
    delete model.langService;
    delete model.searchFields;
    delete model.statusInfo;
  }
}
