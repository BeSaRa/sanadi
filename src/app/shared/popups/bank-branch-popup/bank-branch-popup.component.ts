import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {DateUtils} from '@app/helpers/date-utils';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {BankBranch} from '@app/models/bank-branch';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DatepickerOptionsMap} from '@app/types/types';
import {Observable} from 'rxjs';

@Component({
  selector: 'bank-branch-popup',
  templateUrl: './bank-branch-popup.component.html',
  styleUrls: ['./bank-branch-popup.component.scss']
})
export class BankBranchPopupComponent extends UiCrudDialogGenericComponent<BankBranch> {
  popupTitleKey: keyof ILanguageKeys;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<BankBranch>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'branches';
  }

  _getNewInstance(override?: Partial<BankBranch> | undefined): BankBranch {
    return new BankBranch().clone(override ?? {});
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
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

  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };
}
