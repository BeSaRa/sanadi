import {AdminResult} from "@app/models/admin-result";

export class UserPermission {
  internalUserId!: number;
  permissionId!: number;
  permisionInfo?: AdminResult
}
