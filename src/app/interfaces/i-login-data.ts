import {ExternalUser} from '../models/external-user';
import {Permission} from '../models/permission';
import {InternalUser} from '../models/internal-user';
import {UserTypes} from '../enums/user-types.enum';
import {Team} from '../models/team';
import {InternalDepartment} from '../models/internal-department';
import {UserSecurityConfiguration} from '@app/models/user-security-configuration';
import {Profile} from '@app/models/profile';
import {CustomMenu} from '@app/models/custom-menu';

export interface ILoginData {
  lookupMap: any;
  menuItems: CustomMenu[];
  externalUser: ExternalUser;
  internalDepartment: InternalDepartment;
  internalDepartments: InternalDepartment[];
  internalUser: InternalUser;
  permissionSet: Permission[];
  teams: Team[];
  token: string;
  type: UserTypes;
  profile: Profile;
  userSecConfig: Record<number, UserSecurityConfiguration[]>
}
