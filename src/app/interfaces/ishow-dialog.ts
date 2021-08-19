import {ComponentType} from "@angular/cdk/overlay";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DialogService} from "@app/services/dialog.service";
import {Observable} from "rxjs";

export interface IShowDialog<T> {
  dialog: DialogService

  _getDialogComponent(): ComponentType<any>;

  addDialog(): DialogRef;

  editDialog(model: T): Observable<DialogRef>;
}
