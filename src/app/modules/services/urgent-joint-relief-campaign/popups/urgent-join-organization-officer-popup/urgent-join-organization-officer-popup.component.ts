import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-urgent-join-organization-officer-popup',
  templateUrl: './urgent-join-organization-officer-popup.component.html',
  styleUrls: ['./urgent-join-organization-officer-popup.component.scss']
})
export class UrgentJoinOrganizationOfficerPopupComponent extends UiCrudDialogGenericComponent<OrganizationOfficer> {
  model: OrganizationOfficer;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  _getNewInstance(override?: Partial<OrganizationOfficer> | undefined): OrganizationOfficer {
    return new OrganizationOfficer().clone(override ?? {});
  }

  initPopup(): void {
    this.popupTitleKey = 'organization_officers';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: OrganizationOfficer, originalModel: OrganizationOfficer): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: OrganizationOfficer, form: UntypedFormGroup): Observable<boolean> | boolean {
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


  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<OrganizationOfficer>,
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
