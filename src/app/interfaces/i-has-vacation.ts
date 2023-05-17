import { ExternalUser } from "@app/models/external-user";
import { InternalUser } from "@app/models/internal-user";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable } from "rxjs";

export interface IHasVacation {
  vacationFrom:string|null;
  vacationTo:string|null;
  openVacationDialog(user: InternalUser | ExternalUser,  canEditPreferences: boolean): Observable<DialogRef>
}
