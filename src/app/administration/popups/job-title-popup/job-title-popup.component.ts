import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {JobTitle} from '@app/models/job-title';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {LookupCategories} from '@app/enums/lookup-categories';

@Component({
  selector: 'job-title-popup',
  templateUrl: './job-title-popup.component.html',
  styleUrls: ['./job-title-popup.component.scss']
})
export class JobTitlePopupComponent extends AdminGenericDialog<JobTitle> {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  model!: JobTitle;
  operation: OperationTypes;
  saveVisible = true;
  userTypes: Lookup[] = [];
  disableForm: boolean = false;

  constructor(public dialogRef: DialogRef,
              public fb: FormBuilder,
              public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<JobTitle>,
              private dialogService: DialogService,
              private toast: ToastService,
              private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.disableForm = data.disableForm;
  }

  initPopup(): void {
    this.userTypes = this.lookupService.getByCategory(LookupCategories.USER_TYPE);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.disableForm) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: JobTitle, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: JobTitle, form: FormGroup): Observable<JobTitle> | JobTitle {
    return (new JobTitle()).clone({...model, ...form.value});
  }

  afterSave(model: JobTitle, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_job_title : this.lang.map.lbl_edit_job_title;
  };

  destroyPopup(): void {
  }
}
