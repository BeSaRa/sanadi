import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {CustomMenu} from '@app/models/custom-menu';
import {MenuView} from '@app/enums/menu-view.enum';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {MenuUrlValueContract} from '@contracts/menu-url-value-contract';
import {FactoryService} from '@services/factory.service';
import {LookupService} from '@services/lookup.service';

export class CustomMenuInterceptor implements IModelInterceptor<CustomMenu> {
  receive(model: CustomMenu): CustomMenu {
    CustomMenuInterceptor._receive(model);
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
    CustomMenuInterceptor._parseUrl(model);
    return model;
  }

  send(model: Partial<CustomMenu>): Partial<CustomMenu> {
    model.status = model.status ? CommonStatusEnum.ACTIVATED : CommonStatusEnum.DEACTIVATED;
    model.menuView = model.menuView ? MenuView.PRIVATE : MenuView.PUBLIC;
    CustomMenuInterceptor._stringifyUrl(model);

    CustomMenuInterceptor._deleteBeforeSend(model);

    return model;
  }

  static _stringifyUrl(model: Partial<CustomMenu>): void {
    if (model.urlParamsParsed && model.urlParamsParsed.length > 0) {
      let urlParams = model.urlParamsParsed.map(x => {
        return {[x.name]: x.valueLookups[0].lookupKey};
      });
      model.urlParams = JSON.stringify(urlParams);
    } else {
      model.urlParams = '{}';
    }
  }

  static _parseUrl(model: CustomMenu): void {
    try {
      const service: LookupService = FactoryService.getService('LookupService');
      if (CommonUtils.isValidValue(model.urlParams)) {
        let urlParamsParsed = JSON.parse(model.urlParams);
        urlParamsParsed = urlParamsParsed.map((x: any) => {
          let name: string = Object.keys(x)[0],
            value: number = Object.values<number>(x)[0],
            lookup = service.findLookupByLookupKey(service.listByCategory.MenuItemParameters, value);
          if (!lookup) {
            console.warn('No lookup found matching value ' + value);
          }
          // if lookup is not found, set the value to undefined
          return <MenuUrlValueContract> {
            name: name,
            value: lookup ? value : undefined,
            valueLookups: lookup ? [lookup] : []
          };
        });
        model.urlParamsParsed = urlParamsParsed;
      } else {
        model.urlParamsParsed = [];
      }
    } catch (e) {
      model.urlParamsParsed = [];
    }
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
    delete model.urlParamsParsed;
    delete model.defaultParent;
    delete model.menuItemService;
    delete model.customParentId;
  }
}
