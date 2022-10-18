import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {CustomMenu} from '@app/models/custom-menu';
import {MenuView} from '@app/enums/menu-view.enum';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@helpers/common-utils';

export class CustomMenuInterceptor implements IModelInterceptor<CustomMenu> {
  receive(model: CustomMenu): CustomMenu {
    CustomMenuInterceptor._receive(model);
    return model;
  }

  send(model: Partial<CustomMenu>): Partial<CustomMenu> {
    model.status = model.status ? CommonStatusEnum.ACTIVATED : CommonStatusEnum.DEACTIVATED;
    model.menuView = model.menuView ? MenuView.PRIVATE : MenuView.PUBLIC;
    CustomMenuInterceptor._deleteBeforeSend(model);
    return model;
  }

  static _receive(model: CustomMenu): CustomMenu {
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo));
    model.menuTypeInfo && (model.menuTypeInfo = AdminResult.createInstance(model.menuTypeInfo));
    model.menuViewInfo && (model.menuViewInfo = AdminResult.createInstance(model.menuViewInfo));
    model.parentMenuItemInfo && (model.parentMenuItemInfo = AdminResult.createInstance(model.parentMenuItemInfo));
    model.userTypeInfo && (model.userTypeInfo = AdminResult.createInstance(model.userTypeInfo));
    if (!CommonUtils.isValidValue(model.subMenuItems)) {
      model.subMenuItems = [];
    }
    model.subMenuItems.map(item => CustomMenuInterceptor._receive(new CustomMenu().clone(item)));
    return model;
  }

  static _deleteBeforeSend(model: Partial<CustomMenu>): void {
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    delete model.searchFields;
    delete model.menuTypeInfo;
    delete model.menuViewInfo;
    delete model.parentMenuItemInfo;
    delete model.userTypeInfo;
    delete model.subMenuItems;
  }
}
