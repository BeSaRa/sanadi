import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Result} from '@app/models/result';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';

@Component({
  selector: 'result-list-popup',
  templateUrl: './result-list-popup.component.html',
  styleUrls: ['./result-list-popup.component.scss']
})
export class ResultListPopupComponent extends UiCrudDialogGenericComponent<Result> {
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  model!: Result;
  customValidators = CustomValidators

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<Result>,
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

  _getNewInstance(override?: Partial<Result> | undefined): Result {
    return new Result().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'output_and_impact_analysis';
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: Result, originalModel: Result): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: Result, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: Result, form: UntypedFormGroup): Result | Observable<Result> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
    });
  }

  saveFail(error: Error): void {
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

}
