import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Stage} from '@app/models/stage';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';

@Component({
  selector: 'stage-list-popup',
  templateUrl: './stage-list-popup.component.html',
  styleUrls: ['./stage-list-popup.component.scss']
})
export class StageListPopupComponent extends UiCrudDialogGenericComponent<Stage> {
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  model!: Stage;
  hideFullScreen = true

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<Stage>,
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

  _getNewInstance(override?: Partial<Stage> | undefined): Stage {
    return new Stage().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'stage';
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: Stage, originalModel: Stage): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: Stage, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: Stage, form: UntypedFormGroup): Stage | Observable<Stage> {
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
