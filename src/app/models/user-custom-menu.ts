import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {UserCustomMenuInterceptor} from '@app/model-interceptors/user-custom-menu-interceptor';
import {InterceptModel} from '@decorators/intercept-model';

const {send, receive} = new UserCustomMenuInterceptor();

@InterceptModel({send, receive})
export class UserCustomMenu extends SearchableCloneable<UserCustomMenu> {
  id!: number;
  generalUserId!: number;
  menuItemId!: number;
  statusDateModified!: string;
}
