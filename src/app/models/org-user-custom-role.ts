import {BaseModel} from './base-model';
import {OrgUserCustomRolePermission} from './org-user-custom-role-permission';

export class OrgUserCustomRole extends BaseModel {
  status: boolean | undefined;
  description: string | undefined;
  permissionSet: OrgUserCustomRolePermission[] | undefined;
}
