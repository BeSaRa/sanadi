import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UserCustomMenu} from '@app/models/user-custom-menu';

export class UserCustomMenuInterceptor implements IModelInterceptor<UserCustomMenu> {
  receive(model: UserCustomMenu): UserCustomMenu {
    return model;
  }

  send(model: Partial<UserCustomMenu>): Partial<UserCustomMenu> {
    UserCustomMenuInterceptor._deleteBeforeSend(model);
    return model;
  }

  static _deleteBeforeSend(model: Partial<UserCustomMenu>): void {
    delete model.searchFields;
  }
}
