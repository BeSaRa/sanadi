import { TrainingProgramPartner } from '@app/models/training-program-partner';
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
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { DialogService } from '@app/services/dialog.service';

@Component({
  selector: 'training-program-partner-popup',
  templateUrl: './training-program-partner-popup.component.html',
  styleUrls: ['./training-program-partner-popup.component.scss']
})
export class TrainingProgramPartnerPopupComponent extends AdminGenericDialog<TrainingProgramPartner> {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: UntypedFormGroup;
  model!: TrainingProgramPartner;
  operation: OperationTypes;
  saveVisible = true;

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgramPartner>,
    private dialogService: DialogService,
    private toast: ToastService,
    private lookupService: LookupService) {
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

  beforeSave(model: TrainingProgramPartner, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgramPartner, form: UntypedFormGroup): Observable<TrainingProgramPartner> | TrainingProgramPartner {
    return (new TrainingProgramPartner()).clone({ ...model, ...form.value });
  }

  afterSave(model: TrainingProgramPartner, dialogRef: DialogRef): void {
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
      return this.lang.map.lbl_add_training_program_partner;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_training_program_partner;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
}
