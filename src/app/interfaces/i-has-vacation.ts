import { ExternalUser } from "@app/models/external-user";
import { InternalUser } from "@app/models/internal-user";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable } from "rxjs";

export interface IHasVacation {
  vacationFrom:string;
  vacationTo:string;
  openVacationDialog(user: InternalUser | ExternalUser,  canEditPreferences: boolean): Observable<DialogRef>
}
