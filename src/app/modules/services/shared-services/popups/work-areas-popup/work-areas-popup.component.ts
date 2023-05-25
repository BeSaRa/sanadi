import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminResult} from '@app/models/admin-result';
import {Country} from '@app/models/country';
import {WorkArea} from '@app/models/work-area';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-work-areas-popup',
  templateUrl: './work-areas-popup.component.html',
  styleUrls: ['./work-areas-popup.component.scss']
})
export class WorkAreasPopupComponent extends UiCrudDialogGenericComponent<WorkArea> implements OnInit {
  popupTitleKey: keyof ILanguageKeys;
  countries: Country[] = [];
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<WorkArea>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.countries = data.extras?.countries ?? [];
    this.popupTitleKey = 'work_area';
  }

  _getNewInstance(override?: Partial<WorkArea> | undefined): WorkArea {
    return new WorkArea().clone(override ?? {});
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: WorkArea, originalModel: WorkArea): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<WorkArea>, record2: Partial<WorkArea>): boolean {
    return (record1 as WorkArea).isEqual(record2 as WorkArea);
  }

  beforeSave(model: WorkArea, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: WorkArea, form: UntypedFormGroup): WorkArea | Observable<WorkArea> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      countryInfo: AdminResult.createInstance({
        ...this.countries.find(e => e.id === formValue.country) ?? {}
      })
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  destroyPopup(): void {

  }
}
