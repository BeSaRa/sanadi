import { UntypedFormControl } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { Lookup } from '@app/models/lookup';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { FieldAssessment } from '@app/models/field-assessment';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@contracts/i-dialog-data';
import { DialogService } from '@services/dialog.service';
import { ToastService } from '@services/toast.service';
import { LookupService } from '@services/lookup.service';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'field-assessment-popup',
  templateUrl: './field-assessment-popup.component.html',
  styleUrls: ['./field-assessment-popup.component.scss']
})
export class FieldAssessmentPopupComponent extends AdminGenericDialog<FieldAssessment>  {
  typeList: Lookup[] = this.lookupService.listByCategory.FieldAssessment;
  form!: UntypedFormGroup;
  model!: FieldAssessment;
  operation: OperationTypes;
  saveVisible = true;
  operationTypes = OperationTypes;
  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<FieldAssessment>,
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

  beforeSave(model: FieldAssessment, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: FieldAssessment, form: UntypedFormGroup): Observable<FieldAssessment> | FieldAssessment {
    return (new FieldAssessment()).clone({ ...model, ...form.value });
  }

  afterSave(model: FieldAssessment, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_field_assessment;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_field_assessment;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
  get type(): UntypedFormControl {
    return this.form.get('type') as UntypedFormControl
  }
}
