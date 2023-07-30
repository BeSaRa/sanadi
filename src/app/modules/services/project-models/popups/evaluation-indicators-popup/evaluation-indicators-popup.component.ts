import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {EvaluationIndicator} from '@app/models/evaluation-indicator';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'evaluation-indicators-popup',
  templateUrl: './evaluation-indicators-popup.component.html',
  styleUrls: ['./evaluation-indicators-popup.component.scss']
})
export class EvaluationIndicatorsPopupComponent extends UiCrudDialogGenericComponent<EvaluationIndicator> {
  popupTitleKey: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<EvaluationIndicator>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'project_evaluation_indicators';
  }

  initPopup(): void {

  }

  getPopupHeadingText(): string {
    return '';
  }

  _getNewInstance(override?: Partial<EvaluationIndicator> | undefined): EvaluationIndicator {
    return new EvaluationIndicator().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: EvaluationIndicator, originalModel: EvaluationIndicator): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<EvaluationIndicator>, record2: Partial<EvaluationIndicator>): boolean {
    return (record1 as EvaluationIndicator).isEqual(record2 as EvaluationIndicator);
  }

  beforeSave(model: EvaluationIndicator, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: EvaluationIndicator, form: UntypedFormGroup): Observable<EvaluationIndicator> | EvaluationIndicator {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue
    });
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
