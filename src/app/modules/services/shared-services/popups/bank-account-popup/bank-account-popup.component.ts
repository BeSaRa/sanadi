import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {CaseTypes} from '@app/enums/case-types.enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AdminResult} from '@app/models/admin-result';
import {BankAccount} from '@app/models/bank-account';
import {Country} from '@app/models/country';
import {Lookup} from '@app/models/lookup';
import {CountryService} from '@app/services/country.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'bank-account-popup',
  templateUrl: './bank-account-popup.component.html',
  styleUrls: ['./bank-account-popup.component.scss']
})
export class BankAccountPopupComponent extends UiCrudDialogGenericComponent<BankAccount> {
  popupTitleKey: keyof ILanguageKeys;
  caseType: CaseTypes;
  bankCategoriesList: Lookup[] = this.lookupService.listByCategory.BankCategory;
  currenciesList: Lookup[] = this.lookupService.listByCategory.Currency;
  countriesList: Country[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<BankAccount>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private countryService: CountryService) {
    super();
    this.setInitDialogData(data);
    this.caseType = data.caseType!;
    this.countriesList = data.extras?.countriesList ?? [];
    this.popupTitleKey = 'bank_details';
  }

  initPopup(): void {
    if (!this.countriesList.length) {
      this.loadCountries();
    }
  }

  getPopupHeadingText(): string {
    return this.model.iBan;
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
  }

  _getNewInstance(override?: Partial<BankAccount> | undefined): BankAccount {
    return new BankAccount().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getBankAccountFields(true, this.caseType));
  }

  afterSave(savedModel: BankAccount, originalModel: BankAccount): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: BankAccount, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: BankAccount, form: UntypedFormGroup): Observable<BankAccount> | BankAccount {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      countryInfo: this.countriesList.find((x) => x.id === formValue.country)?.createAdminResult() ?? new AdminResult(),
      currencyInfo: this.currenciesList.find((x) => x.lookupKey === formValue.currency)?.createAdminResult() ?? new AdminResult(),
      bankCategoryInfo: this.bankCategoriesList.find((x) => x.lookupKey === formValue.category) ?? new Lookup(),
    });
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
