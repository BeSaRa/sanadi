import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ProjectNeed} from '@app/models/project-needs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'project-needs-popup',
  templateUrl: './project-needs-popup.component.html',
  styleUrls: ['./project-needs-popup.component.scss']
})
export class ProjectNeedsPopupComponent extends UiCrudDialogGenericComponent<ProjectNeed> {
  popupTitleKey: keyof ILanguageKeys;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ProjectNeed>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'lbl_projects'
  }

  _getNewInstance(override?: Partial<ProjectNeed> | undefined): ProjectNeed {
    return new ProjectNeed().clone(override ?? {});
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ProjectNeed, originalModel: ProjectNeed): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<ProjectNeed>, record2: Partial<ProjectNeed>): boolean {
    return (record1 as ProjectNeed).isEqual(record2 as ProjectNeed);
  }

  beforeSave(model: ProjectNeed, form: UntypedFormGroup): boolean | Observable<boolean> {
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
}
