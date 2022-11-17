import {MenuView} from '@app/enums/menu-view.enum';
import {MenuPermissionCategoryEnum} from '@app/enums/menu-permission-category.enum';
import {MenuTypeEnum} from '@app/enums/menu-type.enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export interface ICustomMenuSearchCriteria {
  'menu-order': number;
  'menu-type': MenuTypeEnum;
  'menu-view': MenuView;
  'user-type': MenuPermissionCategoryEnum;
  'parent-menu-item-id': number;
  status: CommonStatusEnum,
  offset: number;
  limit: number;
}
