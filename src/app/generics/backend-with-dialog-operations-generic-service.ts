import {ComponentType} from "@angular/cdk/portal";
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {IShowDialog} from "@app/interfaces/ishow-dialog";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DialogService} from "@app/services/dialog.service";
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {Observable, of} from "rxjs";
import {exhaustMap} from "rxjs/operators";

export abstract class BackendWithDialogOperationsGenericService<T extends { id: number }> extends BackendGenericService<T> implements IShowDialog<T> {
  /**
   * @description DialogService you have to inject it as public from your service that will extends this class
   */
  abstract dialog: DialogService;

  /**
   * @description implement this method in your child class and return from it the responsible component for your popup
   */
  abstract _getDialogComponent(): ComponentType<any>;

  /**
   * @description this is method to return the popupComponent related to the service that will extends the class
   * @param model
   * @param operation
   * @private
   */
  private getDialog(model: T, operation: OperationTypes): DialogRef {
    return this.dialog.show<IDialogData<T>>(this._getDialogComponent(), {
      operation,
      model
    })
  }

  /**
   * @description open add dialog you can override it in your service class
   * @returns DialogRef reference for the opened dialog
   */
  addDialog(): DialogRef {
    return this.getDialog(new (this._getModel() as { new(...args: any[]): T }), OperationTypes.CREATE);
  }

  /**
   * @description open edit dialog for the given model
   * @param model
   * @returns Observable<DialogRef> Observable of reference for opened dialog
   */
  editDialog(model: T): Observable<DialogRef> {
    return this.getById(model.id)
      .pipe(exhaustMap((model) => of(this.getDialog(model, OperationTypes.UPDATE))));
  }

  /**
   * @description open edit dialog for the given model composite
   * @param model
   * @returns Observable<DialogRef> Observable of reference for opened dialog
   */
  editDialogComposite(model: T): Observable<DialogRef> {
    return this.getByIdComposite(model.id)
      .pipe(exhaustMap((model) => of(this.getDialog(model, OperationTypes.UPDATE))));
  }

}
