import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {LookupService} from '../services/lookup.service';
import {FactoryService} from '../services/factory.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import { MenuItemList } from '@app/models/menu-item-list';
import { MenuView } from '@app/enums/menu-view.enum';

export class MenuItemListInterceptor implements IModelInterceptor<MenuItemList> {
  receive(model: MenuItemList): MenuItemList {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == +model.status)!);
    return model;
  }

  send(model: Partial<MenuItemList>): Partial<MenuItemList> {
    model.status = model.status ? CommonStatusEnum.ACTIVATED : CommonStatusEnum.DEACTIVATED;
    model.menuView = model.menuView ? MenuView.PRIVATE : MenuView.PUBLIC;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    delete model.searchFields;
    return model;
  }
}
