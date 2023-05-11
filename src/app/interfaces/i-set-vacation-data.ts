import { ExternalUser } from "@app/models/external-user";
import { InternalUser } from "@app/models/internal-user";
import { UserPreferences } from "@app/models/user-preferences";

export interface ISetVacationData {
  user: InternalUser | ExternalUser,
  userPreferences:UserPreferences,
  canEditPreferences:boolean
}
