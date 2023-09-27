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
import { TrainingProgramClassification } from '@app/models/training-program-classification';

@Component({
  selector: 'training-program-classification-popup',
  templateUrl: './training-program-classification-popup.component.html',
  styleUrls: ['./training-program-classification-popup.component.scss']
})
export class TrainingProgramClassificationPopupComponent extends AdminGenericDialog<TrainingProgramClassification> {
  form!: UntypedFormGroup;
  model!: TrainingProgramClassification;
  operation: OperationTypes;
  saveVisible = true;

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgramClassification>,
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

  beforeSave(model: TrainingProgramClassification, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgramClassification, form: UntypedFormGroup): Observable<TrainingProgramClassification> | TrainingProgramClassification {
    return (new TrainingProgramClassification()).clone({ ...model, ...form.value });
  }

  afterSave(model: TrainingProgramClassification, dialogRef: DialogRef): void {
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
      return this.lang.map.lbl_add_training_program_classification;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_training_program_classification;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
}
