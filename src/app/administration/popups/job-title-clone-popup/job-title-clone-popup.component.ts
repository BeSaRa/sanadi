import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserTypes } from '@app/enums/user-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { JobTitleClone } from '@app/models/job-title-clone';
import { Lookup } from '@app/models/lookup';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'job-title-clone-popup',
  templateUrl: './job-title-clone-popup.component.html',
  styleUrls: ['./job-title-clone-popup.component.scss']
})
export class JobTitleClonePopupComponent extends AdminGenericDialog<JobTitleClone>{
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: UntypedFormGroup;
  model!: JobTitleClone;
  operation: OperationTypes;
  saveVisible = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter(x => x.lookupKey !== UserTypes.INTEGRATION_USER);

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<JobTitleClone>,
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

  beforeSave(model: JobTitleClone, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: JobTitleClone, form: UntypedFormGroup): Observable<JobTitleClone> | JobTitleClone {
    return (new JobTitleClone()).clone({...model, ...form.value});
  }

  afterSave(model: JobTitleClone, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.form.controls[this.lang.map.lang + 'Name'].value}))
      : this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_job_title;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_job_title;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
}
