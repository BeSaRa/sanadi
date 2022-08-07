import { AdminResult } from "@app/models/admin-result";

export interface HasExternalCooperationAuthority {
  externalCooperationAuthority: number;
  externalCooperationAuthorityInfo: AdminResult;

  getExternalCooperationAuthority(): number;
}
