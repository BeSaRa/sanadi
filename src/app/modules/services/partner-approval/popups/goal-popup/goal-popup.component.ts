import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Goal } from '@app/models/goal';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-goal-popup',
  templateUrl: './goal-popup.component.html',
  styleUrls: ['./goal-popup.component.scss']
})
export class GoalPopupComponent extends UiCrudDialogGenericComponent<Goal>{
  model: Goal;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  hideFullScreen = true;

  _getNewInstance(override?: Partial<Goal> | undefined): Goal {
    return new Goal().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'goal';
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: Goal, originalModel: Goal): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: Goal, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: Goal, form: UntypedFormGroup): Goal | Observable<Goal> {
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
    this.form = this.fb.group(this.model.getGoalsFields(true));
  }

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<Goal>,
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
