import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {CommercialActivity} from '@app/models/commercial-activity';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-commercial-activity-popup',
  templateUrl: './commercial-activity-popup.component.html',
  styleUrls: ['./commercial-activity-popup.component.scss']
})
export class CommercialActivityPopupComponent extends UiCrudDialogGenericComponent<CommercialActivity> {
  model: CommercialActivity;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<CommercialActivity>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  _getNewInstance(override?: Partial<CommercialActivity> | undefined): CommercialActivity {
    return new CommercialActivity().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'commercial_activity'
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: CommercialActivity, originalModel: CommercialActivity): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: CommercialActivity, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: CommercialActivity, form: UntypedFormGroup): CommercialActivity | Observable<CommercialActivity> {
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
    this.form = this.fb.group(this.model.buildForm(true));
  }

  getPopupHeadingText(): string {
    return '';
  }

  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

}
