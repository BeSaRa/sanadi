import { InternalDepartmentService } from '@app/services/internal-department.service';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InternalDepartment } from '@app/models/internal-department';
import { Sector } from '@app/models/sector';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'sector-popup',
  templateUrl: 'sector-popup.component.html',
  styleUrls: ['sector-popup.component.scss']
})
export class SectorPopupComponent extends AdminGenericDialog<Sector> {

  form!: UntypedFormGroup;
  model!: Sector;
  operation: OperationTypes;
  saveVisible = true;
  departmentsList:InternalDepartment[]=[]

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Sector>,
    private toast: ToastService,
    private internalDepartmentService:InternalDepartmentService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.internalDepartmentService.loadAsLookups()
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(list=>this.departmentsList = list)
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: Sector, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Sector, form: UntypedFormGroup): Observable<Sector> | Sector {
    return (new Sector()).clone({ ...model, ...form.value });
  }

  afterSave(model: Sector, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
   if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_Sector;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }

}

