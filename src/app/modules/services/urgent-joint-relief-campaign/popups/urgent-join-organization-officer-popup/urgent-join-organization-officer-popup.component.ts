import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {OrganizationOfficer} from '@app/models/organization-officer';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-urgent-join-organization-officer-popup',
  templateUrl: './urgent-join-organization-officer-popup.component.html',
  styleUrls: ['./urgent-join-organization-officer-popup.component.scss']
})
export class UrgentJoinOrganizationOfficerPopupComponent extends UiCrudDialogGenericComponent<OrganizationOfficer> {
  popupTitleKey: keyof ILanguageKeys;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<OrganizationOfficer>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'organization_officers';
  }

  _getNewInstance(override?: Partial<OrganizationOfficer> | undefined): OrganizationOfficer {
    return new OrganizationOfficer().clone(override ?? {});
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: OrganizationOfficer, originalModel: OrganizationOfficer): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<OrganizationOfficer>, record2: Partial<OrganizationOfficer>): boolean {
    return (record1 as OrganizationOfficer).isEqual(record2 as OrganizationOfficer);
  }

  beforeSave(model: OrganizationOfficer, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: OrganizationOfficer, form: UntypedFormGroup): OrganizationOfficer | Observable<OrganizationOfficer> {
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
