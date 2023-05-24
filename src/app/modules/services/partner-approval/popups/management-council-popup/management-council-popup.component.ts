import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {Lookup} from '@app/models/lookup';
import {ManagementCouncil} from '@app/models/management-council';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-management-council-popup',
  templateUrl: './management-council-popup.component.html',
  styleUrls: ['./management-council-popup.component.scss']
})
export class ManagementCouncilPopupComponent extends UiCrudDialogGenericComponent<ManagementCouncil> {
  popupTitleKey: keyof ILanguageKeys;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ManagementCouncil>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'management_council';
  }

  _getNewInstance(override?: Partial<ManagementCouncil> | undefined): ManagementCouncil {
    return new ManagementCouncil().clone(override ?? {});
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ManagementCouncil, originalModel: ManagementCouncil): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: ManagementCouncil, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: ManagementCouncil, form: UntypedFormGroup): ManagementCouncil | Observable<ManagementCouncil> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      nationalityInfo: this.nationalities.find(x => x.lookupKey === formValue.nationality)?.createAdminResult() ?? new AdminResult(),
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getManagementCouncilFields(true));
  }
}
