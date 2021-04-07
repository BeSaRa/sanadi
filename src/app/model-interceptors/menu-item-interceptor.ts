import {MenuItem} from '../models/menu-item';

export class MenuItemInterceptor {
  static receive(model: MenuItem): MenuItem {
    model.preparePermissionList();
    model.getLangKeyValues();
    model.sanitizeSVG();
    return model;
  }

  static send(model: any): any {
    return model;
  }

}
