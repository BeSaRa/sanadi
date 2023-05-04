import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ProjectNeed } from '@app/models/project-needs';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'project-needs-popup',
  templateUrl: './project-needs-popup.component.html',
  styleUrls: ['./project-needs-popup.component.scss']
})
export class ProjectNeedsPopupComponent extends UiCrudDialogGenericComponent<ProjectNeed> {
  model: ProjectNeed;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  _getNewInstance(override?: Partial<ProjectNeed> | undefined): ProjectNeed {
    return new ProjectNeed().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'project_needs'
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: ProjectNeed, originalModel: ProjectNeed): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: ProjectNeed, form: UntypedFormGroup): boolean | Observable<boolean> {
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
  prepareModel(model: ProjectNeed, form: UntypedFormGroup): ProjectNeed | Observable<ProjectNeed> {
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
    this.form = this.fb.group(this.model.buildForm(true));
  }
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ProjectNeed>,
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
}
