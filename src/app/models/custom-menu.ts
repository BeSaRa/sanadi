import { MenuItemService } from '@app/services/menu-item.service';
import { CommonUtils } from '@app/helpers/common-utils';
import { MenuItem } from '@app/models/menu-item';
import {InterceptModel} from '@app/decorators/decorators/intercept-model';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {INames} from '@app/interfaces/i-names';
import {CustomMenuInterceptor} from '@app/model-interceptors/custom-menu-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {CustomMenuService} from '@services/custom-menu.service';
import {BaseModel} from './base-model';
import {AdminResult} from '@app/models/admin-result';
import {MenuUrlValueContract} from '@contracts/menu-url-value-contract';
import {UserTypes} from '@app/enums/user-types.enum';
import {Validators} from '@angular/forms';

const interceptor = new CustomMenuInterceptor();

@InterceptModel({
  receive: interceptor.receive,
})
export class CustomMenu extends BaseModel<CustomMenu, CustomMenuService> {
  status!: number;
  menuOrder!: number;
  menuType!: number;
  menuView!: number;
  userType!: number;
  menuURL!: string;
  urlParams: string = '';
  parentMenuItemId?: number;
  statusDateModified!: string;
  statusInfo!: AdminResult;
  menuTypeInfo!: AdminResult;
  menuViewInfo!: AdminResult;
  parentMenuItemInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  subMenuItems: CustomMenu[] = [];
  defaultParent?:MenuItem;
  systemMenuKey?: string;
  icon!:string;
  isSystem!:boolean;

  // extra properties
  service!: CustomMenuService;
  menuItemService!: MenuItemService;
  langService: LangService;
  urlParamsParsed: MenuUrlValueContract[] = [];
  customParentId!:number;
  isSystemParent:boolean = false;

  searchFields: ISearchFieldsMap<CustomMenu> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['menuTypeInfo', 'statusInfo']),
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('CustomMenuService');
    this.menuItemService = FactoryService.getService('MenuItemService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
  getNameWithSystemParent(){
    const systemMenu = this.getSystemParent();
    if(!!systemMenu && this.isSystemParent){
      return systemMenu.getName() ;
    }
    return this.getName();
  }

  getSystemParent() {
    if(!CommonUtils.isValidValue(this.systemMenuKey)){
      return undefined;
    }
    return this.menuItemService.menuItems.find(x=>x.menuKey === this.systemMenuKey);
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      menuOrder,
      status,
      menuType,
      menuView,
      userType,
      parentMenuItemId,
      icon,
      systemMenuKey
    } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')]] : arName,
      enName: controls ? [enName, [CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')]] : enName,
      status: controls ? [status, []] : status,
      menuOrder: controls ? [menuOrder, [CustomValidators.required, CustomValidators.number, Validators.max(99)]] : menuOrder,
      menuType: controls ? [menuType, [CustomValidators.required]] : menuType,
      menuView: controls ? [menuView, []] : menuView,
      userType: controls ? [userType, [CustomValidators.required]] : userType,
      icon: controls ? [icon, [CustomValidators.required]] : icon,
      parentMenuItemId: controls ? [parentMenuItemId, []] : parentMenuItemId,
      systemMenuKey: controls ? [systemMenuKey,[]] : systemMenuKey
    };
  }

  buildMenuUrlForm(controls?: boolean): any {
    const {menuURL} = this;
    return {
      menuURL: controls ? [menuURL, [CustomValidators.maxLength(350)]] : menuURL
    };
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }

  isParentMenu(): boolean {
    return !this.parentMenuItemId;
  }

  isExternalUserMenu(): boolean {
    return this.userType === UserTypes.EXTERNAL;
  }

  isInternalUserMenu(): boolean {
    return this.userType === UserTypes.INTERNAL;
  }

  isDefaultItem(){
    return this.id === 1
  }
  hasDefaultParent(){
    return this.parentMenuItemId === 1;
  }
}
