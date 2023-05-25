import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Lookup} from '@app/models/lookup';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {LookupService} from "@services/lookup.service";
import {OperationTypes} from "@enums/operation-types.enum";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {Observable} from "rxjs";
import {AdminResult} from "@models/admin-result";

@Component({
  selector: 'app-TIFA-executive-management-popup',
  templateUrl: './TIFA-executive-management-popup.component.html',
  styleUrls: ['./TIFA-executive-management-popup.component.scss']
})
export class TIFAExecutiveManagementPopupComponent extends UiCrudDialogGenericComponent<TransferFundsExecutiveManagement> {
  popupTitleKey: keyof ILanguageKeys;
  isCancel: boolean = false;

  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality
    .sort((a, b) => a.lookupKey - b.lookupKey);

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<TransferFundsExecutiveManagement>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService) {
    super();
    this.setInitDialogData(data);
    this.isCancel = (data.extras && data.extras.isCancel) ?? false;
    this.popupTitleKey = 'executive'
  }

  initPopup() {
  }

  _getNewInstance(override: Partial<TransferFundsExecutiveManagement> | undefined): TransferFundsExecutiveManagement {
    return new TransferFundsExecutiveManagement().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: TransferFundsExecutiveManagement, originalModel: TransferFundsExecutiveManagement): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<TransferFundsExecutiveManagement>, record2: Partial<TransferFundsExecutiveManagement>): boolean {
    return (record1 as TransferFundsExecutiveManagement).isEqual(record2 as TransferFundsExecutiveManagement);
  }

  beforeSave(model: TransferFundsExecutiveManagement, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: TransferFundsExecutiveManagement, form: UntypedFormGroup): Observable<TransferFundsExecutiveManagement> | TransferFundsExecutiveManagement {
    let formValue = form.getRawValue();
    const executiveNationalityInfo = this.nationalities.find(x => x.lookupKey == formValue.executiveNationality)?.createAdminResult() ?? new AdminResult();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      executiveNationalityInfo
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  destroyPopup(): void {
  }

  getPopupHeadingText(): string {
    return this.lang.map.lang === 'ar' ? this.model.nameLikePassport : this.model.englishNameLikePassport;
  }
}
