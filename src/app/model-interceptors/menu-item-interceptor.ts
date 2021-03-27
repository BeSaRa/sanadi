import {MenuItem} from '../models/menu-item';

export class MenuItemInterceptor {
  static receive(model: MenuItem): MenuItem {
    model.preparePermissionList();
    return model;
  }

  static send(model: any): any {
    return model;
  }

}
