import { IMyDateModel } from 'angular-mydatepicker';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { INames } from '@app/interfaces/i-names';
import { MenuItemListInterceptor } from '@app/model-interceptors/menu-item-list-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { MenuItemListService } from './../services/menu-item-list.service';
import { BaseModel } from './base-model';
import { Lookup } from './lookup';

const interceptor = new MenuItemListInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class MenuItemList extends BaseModel<MenuItemList, MenuItemListService> {

  status!: number;
  menuOrder!: number;
  menuType!: number;
  menuView!: number;
  userType!: number;
  menuURL!: string;
  parentMenuItemId: number|null =null;
  langService: LangService;
  statusInfo!: Lookup;
  statusDateModified?: string | IMyDateModel = undefined;

  service!: MenuItemListService;

  searchFields: ISearchFieldsMap<MenuItemList> = {
    ...normalSearchFields(['arName', 'enName', 'menuURL']),
    ...infoSearchFields(['statusInfo']),
  };
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('MenuItemListService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
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
      menuURL,
      parentMenuItemId,
    } = this;
    return {
      arName: controls
        ? [
            arName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ARABIC_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
              CustomValidators.pattern('AR_NUM_ONE_AR'),
            ],
          ]
        : arName,
      enName: controls
        ? [
            enName,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
              CustomValidators.minLength(
                CustomValidators.defaultLengths.MIN_LENGTH
              ),
              CustomValidators.pattern('ENG_NUM_ONE_ENG'),
            ],
          ]
        : enName,
      status: controls ? [status, []] : status,
      menuOrder: controls
        ? [menuOrder, [CustomValidators.required,CustomValidators.number]]
        : menuOrder,
      menuType: controls ? [menuType, [CustomValidators.required]] : menuType,
      menuView: controls ? [menuView, []] : menuView,
      userType: controls ? [userType, [CustomValidators.required]] : userType,
      menuURL: controls
        ? [
            menuURL,
            [
              CustomValidators.pattern('URL'),
              CustomValidators.maxLength(350),
            ],
          ]
        : menuURL,
      parentMenuItemId: controls
        ? [parentMenuItemId, []]
        : parentMenuItemId,
    };
  }
}
