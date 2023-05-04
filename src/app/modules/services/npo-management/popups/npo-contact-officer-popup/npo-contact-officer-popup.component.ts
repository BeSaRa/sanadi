import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { JobTitle } from '@app/models/job-title';
import { LangService } from '@app/services/lang.service';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { Observable } from 'rxjs';
import { AdminResult } from '@app/models/admin-result';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { JobTitleService } from '@app/services/job-title.service';

@Component({
  selector: 'app-npo-contact-officer-popup',
  templateUrl: './npo-contact-officer-popup.component.html',
  styleUrls: ['./npo-contact-officer-popup.component.scss']
})
export class NpoContactOfficerPopupComponent extends  UiCrudDialogGenericComponent<NpoContactOfficer> {
  operation: OperationTypes;
  model: NpoContactOfficer;
  form!: UntypedFormGroup;
  popupTitleKey!: keyof ILanguageKeys;
  jobTitleAdminLookup: JobTitle[] = [];
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<NpoContactOfficer>,
  public lang: LangService,
  public dialogRef: DialogRef,
  public dialogService: DialogService,
  public fb: UntypedFormBuilder,
  public toast: ToastService,
  private JobTitleService:JobTitleService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }
  _getNewInstance(override?: Partial<NpoContactOfficer> | undefined): NpoContactOfficer {
    return new NpoContactOfficer().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'contact_officers';
    this.JobTitleService.loadActive().subscribe((data) => {
      this.jobTitleAdminLookup = data;
    })
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: NpoContactOfficer, originalModel: NpoContactOfficer): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: NpoContactOfficer, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    const isDuplicate = this.list.some((x) => x === form.getRawValue());
    if (isDuplicate) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }
  prepareModel(model: NpoContactOfficer, form: UntypedFormGroup): NpoContactOfficer | Observable<NpoContactOfficer> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      jobInfo: this.jobTitleAdminLookup.find(x=>x.id === formValue.JobTitle)?.createAdminResult() ?? new AdminResult()
    });
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.getContactOfficerFields(true));
  }
}
