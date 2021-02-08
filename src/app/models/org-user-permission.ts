import {AdminResult} from './admin-result';

export class OrgUserPermission {
  id: number | undefined;
  orgUserId: number | undefined;
  permissionId: number | undefined;
  permisionInfo: AdminResult | undefined;
}
