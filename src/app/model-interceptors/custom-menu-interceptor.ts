import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {LookupService} from '@services/lookup.service';
import {FactoryService} from '@services/factory.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {CustomMenu} from '@app/models/custom-menu';
import {MenuView} from '@app/enums/menu-view.enum';

export class CustomMenuInterceptor implements IModelInterceptor<CustomMenu> {
  receive(model: CustomMenu): CustomMenu {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == +model.status)!);
    return model;
  }

  send(model: Partial<CustomMenu>): Partial<CustomMenu> {
    model.status = model.status ? CommonStatusEnum.ACTIVATED : CommonStatusEnum.DEACTIVATED;
    model.menuView = model.menuView ? MenuView.PRIVATE : MenuView.PUBLIC;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    delete model.searchFields;
    return model;
  }
}
