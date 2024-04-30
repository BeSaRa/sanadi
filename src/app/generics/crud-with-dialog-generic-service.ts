import { ComponentType } from "@angular/cdk/portal";
import { IShowDialog } from "@app/interfaces/ishow-dialog";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DialogService } from "@app/services/dialog.service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { Observable, of } from "rxjs";
import { exhaustMap } from "rxjs/operators";
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Cloneable } from "@app/models/cloneable";

export abstract class CrudWithDialogGenericService<T extends { id: number }> extends CrudGenericService<T> implements IShowDialog<T> {
  /**
   * @description DialogService you have to inject it as public from your service that will extend this class
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
  addDialog(): DialogRef | Observable<DialogRef> {
    return this.getDialog(new (this._getModel()), OperationTypes.CREATE);
  }
  /**
   * @description open add dialog you can override it in your service class
   * @returns DialogRef reference for the opened dialog
   */
  copyDialog(model:T): DialogRef {
    return this.getDialog( model, OperationTypes.CREATE);
  }

  /**
   * @description open edit dialog for the given model
   * @param model
   * @param getById
   * @returns Observable<DialogRef> Observable of reference for opened dialog
   */
  editDialog(model: T, getById: boolean = true): Observable<DialogRef> {
    return (getById ? this.getById(model.id) : of(model))
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

 /* /!**
   * @description open view dialog for the given model
   * @param model
   * @param getById
   * @returns Observable<DialogRef> Observable of reference for opened dialog
   *!/
  viewDialog(model: T, getById: boolean = true): Observable<DialogRef> {
    return (getById ? this.getById(model.id) : of(model))
      .pipe(exhaustMap((model) => of(this.getDialog(model, OperationTypes.VIEW))));
  }

  /!**
   * @description open view dialog for the given model composite
   * @param model
   * @returns Observable<DialogRef> Observable of reference for opened dialog
   *!/
  viewDialogComposite(model: T): Observable<DialogRef> {
    return this.getByIdComposite(model.id)
      .pipe(exhaustMap((model) => of(this.getDialog(model, OperationTypes.VIEW))));
  }*/

}
