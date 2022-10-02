import { OrgUnit } from '../models/org-unit';
import { OrgBranch } from '../models/org-branch';
import { OrgUser } from '../models/org-user';
import { Permission } from '../models/permission';
import { InternalUser } from '../models/internal-user';
import { UserTypes } from '../enums/user-types.enum';
import { Team } from '../models/team';
import { InternalDepartment } from '../models/internal-department';
import { UserSecurityConfiguration } from "@app/models/user-security-configuration";
import { Profile } from '@app/models/profile';

export interface ILoginData {
  lookupMap: any;
  orgBranch: OrgBranch;
  orgUnit: OrgUnit;
  orgUser: OrgUser;
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
