import {UserSecurityConfiguration} from "@app/models/user-security-configuration";

export interface IUserSecurity {
  override: Partial<UserSecurityConfiguration>;
  list: Partial<UserSecurityConfiguration>[];
}
