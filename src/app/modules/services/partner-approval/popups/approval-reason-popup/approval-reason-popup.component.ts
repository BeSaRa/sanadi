import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ApprovalReason } from '@app/models/approval-reason';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-approval-reason-popup',
  templateUrl: './approval-reason-popup.component.html',
  styleUrls: ['./approval-reason-popup.component.scss']
})
export class ApprovalReasonPopupComponent extends UiCrudDialogGenericComponent<ApprovalReason> {
  model: ApprovalReason;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  _getNewInstance(override?: Partial<ApprovalReason> | undefined): ApprovalReason {
    return new ApprovalReason().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'approval_reasons';
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: ApprovalReason, originalModel: ApprovalReason): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: ApprovalReason, form: UntypedFormGroup): boolean | Observable<boolean> {
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
  prepareModel(model: ApprovalReason, form: UntypedFormGroup): ApprovalReason | Observable<ApprovalReason> {
    let formValue = form.getRawValue();
     return this._getNewInstance({
       ...this.model,
       ...formValue
      });
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.getApprovalReasonFields(true));
  }
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ApprovalReason>,
               public lang: LangService,
               public dialogRef: DialogRef,
               public dialogService: DialogService,
               public fb: UntypedFormBuilder,
               public toast: ToastService) {
     super();
     this.model = data.model;
     this.operation = data.operation;
     this.list = data.list;
   }

}
