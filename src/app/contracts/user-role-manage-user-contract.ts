import {OperationTypes} from '@app/enums/operation-types.enum';

export interface UserRoleManageUserContract {
  isSuperAdmin: (operation: OperationTypes) => boolean;
  isActingSuperAdmin: () => boolean;
  isSubAdmin: () => boolean;
  isApprovalAdmin: () => boolean;
}
