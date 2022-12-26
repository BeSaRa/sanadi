import {AdminResult} from '../models/admin-result';
import {ExternalUserPermission} from '../models/external-user-permission';
import {IModelInterceptor} from '@contracts/i-model-interceptor';

export class ExternalUserPermissionInterceptor implements IModelInterceptor<ExternalUserPermission> {
  send(model: Partial<ExternalUserPermission>): Partial<ExternalUserPermission> {
    ExternalUserPermissionInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: ExternalUserPermission): ExternalUserPermission {
    model.externalUserInfo && (model.externalUserInfo = AdminResult.createInstance(model.externalUserInfo));
    model.permisionInfo && (model.permisionInfo = AdminResult.createInstance(model.permisionInfo));
    return model
  }

  private static _deleteBeforeSend(model: Partial<ExternalUserPermission>): void {
    delete model.searchFields;
    delete model.externalUserInfo;
    delete model.permisionInfo;
  }
}
