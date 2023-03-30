import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {ActionRegistry} from '../models/action-registry';
import {AdminResult} from '../models/admin-result';

export class ActionRegistryInterceptor implements IModelInterceptor<ActionRegistry> {
  receive(model: ActionRegistry): ActionRegistry {
    model.ouFromInfo = AdminResult.createInstance(model.ouFromInfo);
    model.userFromInfo = AdminResult.createInstance(model.userFromInfo);
    model.userToInfo = AdminResult.createInstance(model.userToInfo);
    model.ouToInfo = AdminResult.createInstance(model.ouToInfo);
    model.actionInfo = AdminResult.createInstance(model.actionInfo);
    return model;
  }

  send(model: any): any {
    delete model.langService;
    return model;
  }
}
