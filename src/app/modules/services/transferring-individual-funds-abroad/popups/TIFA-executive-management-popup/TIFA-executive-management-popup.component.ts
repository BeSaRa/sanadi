import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Lookup} from '@app/models/lookup';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";
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
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey: keyof ILanguageKeys;
  model: TransferFundsExecutiveManagement;
  isCancel: boolean = false;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<TransferFundsExecutiveManagement>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private lookupService: LookupService,) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.listIndex = data.listIndex;
    this.list = data.list;
    this.isCancel = (data.extras && data.extras.isCancel) ?? false;
    this.popupTitleKey = 'executive'
  }

  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality
    .sort((a, b) => a.lookupKey - b.lookupKey);

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

  private isDuplicate(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => item.executiveIdentificationNumber === formValue.executiveIdentificationNumber);
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: TransferFundsExecutiveManagement, index: number) => {
        return index !== this.listIndex && item.executiveIdentificationNumber === formValue.executiveIdentificationNumber;
      });
    }
    return false;
  }

  beforeSave(model: TransferFundsExecutiveManagement, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicate(form.getRawValue())) {
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
    return this.lang.map.lang === 'ar' ?  this.model.nameLikePassport : this.model.englishNameLikePassport;
  }
}
