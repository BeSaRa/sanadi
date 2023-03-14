import {MenuView} from '@app/enums/menu-view.enum';
import {MenuTypeEnum} from '@app/enums/menu-type.enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {UserTypes} from '@app/enums/user-types.enum';

export interface ICustomMenuSearchCriteria {
  'menu-order': number;
  'menu-type': MenuTypeEnum;
  'menu-view': MenuView;
  'user-type': UserTypes;
  'parent-menu-item-id': number;

  status: CommonStatusEnum,
  offset: number;
  limit: number;
}
