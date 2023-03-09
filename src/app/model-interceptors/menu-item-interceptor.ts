import {MenuItem} from '../models/menu-item';
import {IModelInterceptor} from '@contracts/i-model-interceptor';

export class MenuItemInterceptor implements IModelInterceptor<MenuItem> {
  receive(model: MenuItem): MenuItem {
    model.preparePermissionList();
    model.getLangKeyValues();
    model.sanitizeSVG();
    return model;
  }

  send(model: Partial<MenuItem>): Partial<MenuItem> {
    delete model.customMenu;
    delete model.data;
    return model;
  }
}
