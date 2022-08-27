import { MenuItem } from '../models/menu-item';

export class MenuItemInterceptor {
  receive(model: MenuItem): MenuItem {
    model.preparePermissionList();
    model.getLangKeyValues();
    model.sanitizeSVG();
    return model;
  }

  send(model: any): any {
    return model;
  }

}
