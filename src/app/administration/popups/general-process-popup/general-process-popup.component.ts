import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DIALOG_DATA_TOKEN } from './../../../shared/tokens/tokens';
import { DialogRef } from './../../../shared/models/dialog-ref';
import { LangService } from './../../../services/lang.service';
import { IDialogData } from './../../../interfaces/i-dialog-data';
import { DialogService } from './../../../services/dialog.service';
import { ToastService } from './../../../services/toast.service';
import { LookupService } from './../../../services/lookup.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Lookup } from './../../../models/lookup';
import { OperationTypes } from './../../../enums/operation-types.enum';
import { GeneralProcess } from './../../../models/genral-process';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-general-process-popup',
  templateUrl: './general-process-popup.component.html',
  styleUrls: ['./general-process-popup.component.css']
})
export class GeneralProcessPopupComponent extends AdminGenericDialog<GeneralProcess> {
  form!: UntypedFormGroup;
  model!: GeneralProcess;
  operation: OperationTypes;
  saveVisible = true;

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<GeneralProcess>,
    private dialogService: DialogService,
    private toast: ToastService,
    private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }
  initPopup(): void {

  }
  afterSave(model: GeneralProcess, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }
  beforeSave(model: GeneralProcess, form: UntypedFormGroup): boolean | Observable<boolean> {
    return form.valid;
  }
  prepareModel(model: GeneralProcess, form: UntypedFormGroup): GeneralProcess | Observable<GeneralProcess> {
    return (new GeneralProcess()).clone({ ...model, ...form.value });
  }
  get title(): keyof ILanguageKeys {
    if (this.operation === OperationTypes.CREATE) {
      return 'lbl_add_process_template';
    } else if (this.operation === OperationTypes.UPDATE) {
      return 'lbl_edit_process_template';
    } else {
      return 'view';
    }
  };

  saveFail(error: Error): void {
  }
  destroyPopup(): void {
  }
}
