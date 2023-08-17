import { TrainingProgramAudience } from './../../../models/training-program-audience';
import { Component, Inject } from '@angular/core';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ToastService } from '@app/services/toast.service';
import { OperationTypes } from '@app/enums/operation-types.enum';

@Component({
  selector: 'training-program-audience-popup',
  templateUrl: './training-program-audience-popup.component.html',
  styleUrls: ['./training-program-audience-popup.component.scss']
})
export class TrainingProgramAudiencePopupComponent extends AdminGenericDialog<TrainingProgramAudience> {
  form!: UntypedFormGroup;
  model!: TrainingProgramAudience;
  operation: OperationTypes;
  saveVisible = true;

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgramAudience>,
    private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: TrainingProgramAudience, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgramAudience, form: UntypedFormGroup): Observable<TrainingProgramAudience> | TrainingProgramAudience {
    return (new TrainingProgramAudience()).clone({ ...model, ...form.value });
  }

  afterSave(model: TrainingProgramAudience, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_training_program_audience;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_training_program_audience;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
}
