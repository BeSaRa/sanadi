import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AdminLookup } from '@app/models/admin-lookup';
import { BaseModel } from '@app/models/base-model';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerControlsMap } from '@app/types/types';
import { isObservable, Observable, of } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'activity-types-popup',
  templateUrl: './activity-types-popup.component.html',
  styleUrls: ['./activity-types-popup.component.scss']
})
export class ActivityTypesPopupComponent extends AdminGenericDialog<AdminLookup> {
  form!: UntypedFormGroup;
  model!: AdminLookup;
  operation: OperationTypes;
  saveVisible = true;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;

  constructor(
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<AdminLookup>,
    private toast: ToastService,
    private lookupService: LookupService
  ) {
    super();
    this.model = new AdminLookup().clone({ ...data.model });
    this.operation = data.operation;
  }

  initPopup(): void { }

  listenToSave(): void {
    this.save$
      // call before Save callback
      .pipe(
        switchMap(() => {
          const result = this.beforeSave(this.model, this.form);
          return isObservable(result) ? result : of(result);
        })
      )
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter((value) => value))
      .pipe(
        switchMap((_) => {
          const result = this.prepareModel(this.model, this.form);
          return isObservable(result) ? result : of(result);
        })
      )
      .pipe(
        exhaustMap((model: AdminLookup) => {
          let save$ = model.update(AdminLookupTypeEnum.ACTIVITY_TYPE);
          return save$.pipe(
            catchError((error) => {
              this.saveFail(error);
              return of({
                error,
                model,
              });
            })
          );
        })
      )
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model) => {
        this.afterSave(model as AdminLookup, this.dialogRef);
      });
  }
  buildForm(): void {

    this.form = this.fb.group(this.model.buildActivityTypeForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(
    model: AdminLookup,
    form: UntypedFormGroup
  ): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(
    model: AdminLookup,
    form: UntypedFormGroup
  ): Observable<AdminLookup> | AdminLookup {
    return new AdminLookup().clone({ ...model, ...form.value, type: AdminLookupTypeEnum.ACTIVITY_TYPE });
  }
  afterSave(model: AdminLookup, dialogRef: DialogRef): void {
    const message =
      this.operation === OperationTypes.CREATE
        ? this.lang.map.msg_create_x_success
        : this.lang.map.msg_update_x_success;

    this.operation === this.operationTypes.CREATE
      ? this.toast.success(
        message.change({
          x: this.form.controls[this.lang.map.lang + 'Name'].value,
        })
      )
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void { }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_vacation;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_vacation;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  }

  destroyPopup(): void { }

}
