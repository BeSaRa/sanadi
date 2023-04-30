import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { BankBranch } from '@app/models/bank-branch';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'bank-branch-popup',
  templateUrl: './bank-branch-popup.component.html',
  styleUrls: ['./bank-branch-popup.component.scss']
})
export class BankBranchPopupComponent extends UiCrudDialogGenericComponent<BankBranch> {
  model: BankBranch;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  _getNewInstance(override?: Partial<BankBranch> | undefined): BankBranch {
    return new BankBranch().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'branches';
  }
  destroyPopup(): void {
  }

  afterSave(savedModel: BankBranch, originalModel: BankBranch): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: BankBranch, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: BankBranch, form: UntypedFormGroup): BankBranch | Observable<BankBranch> {
    let formValue = form.getRawValue();
     return this._getNewInstance({
       ...this.model,
       ...formValue,
     });
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.getBranchFields(true));
  }
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<BankBranch>,
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
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' })
  };
}
