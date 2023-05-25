import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ApprovalReason} from '@app/models/approval-reason';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-approval-reason-popup',
  templateUrl: './approval-reason-popup.component.html',
  styleUrls: ['./approval-reason-popup.component.scss']
})
export class ApprovalReasonPopupComponent extends UiCrudDialogGenericComponent<ApprovalReason> {
  popupTitleKey: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ApprovalReason>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'approval_reasons';
  }

  _getNewInstance(override?: Partial<ApprovalReason> | undefined): ApprovalReason {
    return new ApprovalReason().clone(override ?? {});
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ApprovalReason, originalModel: ApprovalReason): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<ApprovalReason>, record2: Partial<ApprovalReason>): boolean {
    return (record1 as ApprovalReason).isEqual(record2 as ApprovalReason);
  }

  beforeSave(model: ApprovalReason, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }

    if (this.isDuplicateInList(form.getRawValue())) {
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

}
