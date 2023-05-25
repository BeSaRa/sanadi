import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {ProjectComponent} from "@models/project-component";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable} from 'rxjs';
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";

@Component({
  selector: 'component-budgets-popup',
  templateUrl: './component-budgets-popup.component.html',
  styleUrls: ['./component-budgets-popup.component.scss']
})
export class ComponentBudgetsPopupComponent extends UiCrudDialogGenericComponent<ProjectComponent> {
  popupTitleKey: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ProjectComponent>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'project_components_budgets';
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  _getNewInstance(override?: Partial<ProjectComponent> | undefined): ProjectComponent {
    return new ProjectComponent().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: ProjectComponent, originalModel: ProjectComponent): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<ProjectComponent>, record2: Partial<ProjectComponent>): boolean {
    return (record1 as ProjectComponent).isEqual(record2 as ProjectComponent);
  }

  beforeSave(model: ProjectComponent, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: ProjectComponent, form: UntypedFormGroup): ProjectComponent | Observable<ProjectComponent> {
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
