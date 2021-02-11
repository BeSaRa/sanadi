import {OrgUnit} from '../models/org-unit';
import {OrgBranch} from '../models/org-branch';
import {OrgUser} from '../models/org-user';
import {Permission} from '../models/permission';

export interface ILoginData {
  lookupMap: any;
  orgBranch: OrgBranch;
  orgUnit: OrgUnit;
  orgUser: OrgUser;
  permissionSet: Permission[];
  token: string;
}
