import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {DomainTypes} from '@app/enums/domain-types';
import {AdminLookup} from '@app/models/admin-lookup';
import {AdminResult} from '@app/models/admin-result';
import {Lookup} from '@app/models/lookup';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {DacOchaService} from '@app/services/dac-ocha.service';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CustomValidators} from '@app/validators/custom-validators';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {DialogService} from "@services/dialog.service";
import {ToastService} from '@app/services/toast.service';
import {CountryService} from "@services/country.service";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {OperationTypes} from "@enums/operation-types.enum";
import {Observable} from "rxjs";
import {Country} from "@models/country";
import {LookupService} from "@services/lookup.service";

@Component({
  selector: 'app-TIFA-purpose-popup',
  templateUrl: './TIFA-purpose-popup.component.html',
  styleUrls: ['./TIFA-purpose-popup.component.scss']
})
export class TIFAPurposePopupComponent extends UiCrudDialogGenericComponent<TransferFundsCharityPurpose> {
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  model: TransferFundsCharityPurpose;
  isCancel: boolean = false;
  countries: Country[] = [];
  listIndex: number;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<TransferFundsCharityPurpose>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private dacOchaService: DacOchaService,
              private lookupService: LookupService,
              private countryService: CountryService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.listIndex = data.listIndex;
    this.list = data.list;
    this.isCancel = (data.extras && data.extras.isCancel) ?? false;
    this.countries = data.extras?.countries ?? [];
  }

  projectTypes: Lookup[] = this.lookupService.listByCategory.InternalProjectType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  domains: Lookup[] = this.lookupService.listByCategory.Domain
    .sort((a, b) => a.lookupKey - b.lookupKey);

  mainOchas: AdminLookup[] = [];
  mainDacs: AdminLookup[] = [];
  isHumanitarian = false;
  isDevelopment = false;

  initPopup(): void {
    this.popupTitleKey = 'purpose';
    if (!this.countries.length) {
      this.loadCountries();
    }
  }

  _getNewInstance(override: Partial<TransferFundsCharityPurpose> | undefined): TransferFundsCharityPurpose {
    return new TransferFundsCharityPurpose().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.handleDomainChange(this.model.domain);
  }

  afterSave(savedModel: TransferFundsCharityPurpose, originalModel: TransferFundsCharityPurpose): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  private isDuplicate(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => item.isEqual(formValue));
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: TransferFundsCharityPurpose, index: number) => {
        return index !== this.listIndex && item.isEqual(formValue);
      });
    }
    return false;
  }

  beforeSave(model: TransferFundsCharityPurpose, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: TransferFundsCharityPurpose, form: UntypedFormGroup): Observable<TransferFundsCharityPurpose> | TransferFundsCharityPurpose {
    let formValue = form.getRawValue();
    const projectTypeInfo = this.projectTypes.find(x => x.lookupKey == formValue.projectType)?.createAdminResult() ?? new AdminResult();
    const domainInfo = this.domains.find(x => x.lookupKey == formValue.domain)?.createAdminResult() ?? new AdminResult();
    const mainUNOCHACategoryInfo = this.mainOchas.find(x => x.id == formValue.mainUNOCHACategory)?.createAdminResult() ?? new AdminResult();
    const mainDACCategoryInfo = this.mainDacs.find(x => x.id == formValue.mainDACCategory)?.createAdminResult() ?? new AdminResult();
    const beneficiaryCountryInfo = this.countries.find(x => x.id == formValue.beneficiaryCountry)?.createAdminResult() ?? new AdminResult();
    const executionCountryInfo = this.countries.find(x => x.id == formValue.executionCountry)?.createAdminResult() ?? new AdminResult();

    return this._getNewInstance({
      ...this.model,
      ...formValue,
      projectTypeInfo,
      domainInfo,
      mainUNOCHACategoryInfo,
      mainDACCategoryInfo,
      beneficiaryCountryInfo,
      executionCountryInfo,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  handleDomainChange(value: any, userInteraction: boolean = false) {
    if (userInteraction) {
      this.mainDACCategory.setValue(null);
      this.mainUNOCHACategory.setValue(null);
    }
    if (value === DomainTypes.HUMANITARIAN) {
      this.showAndRequireMainUNOCHACategory();
      this.hideAndDontRequireMainDACCategory();
      this.loadOchas();
    } else if (value === DomainTypes.DEVELOPMENT) {
      this.hideAndDontRequireMainUNOCHACategory();
      this.showAndRequireMainDACCategory();
      this.loadDacs();
    } else {
      this.hideAndDontRequireMainUNOCHACategory();
      this.hideAndDontRequireMainDACCategory();
    }
  }

  showAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }

  showAndDontRequireMainDACCategory() {
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  private loadOchas() {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.OCHA).subscribe(list => {
      this.mainOchas = list;
    });
  }

  showAndRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.setValidators([CustomValidators.required]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = true;
  }

  hideAndDontRequireMainDACCategory() {
    this.mainDACCategory.patchValue(null);
    this.mainDACCategory.setValidators([]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = false;
  }

  private loadDacs() {
    this.dacOchaService.loadByType(AdminLookupTypeEnum.DAC).subscribe(list => {
      this.mainDacs = list;
    });
  }

  hideAndDontRequireMainUNOCHACategory() {
    this.mainUNOCHACategory.patchValue(null);
    this.mainUNOCHACategory.setValidators([]);
    this.mainUNOCHACategory.updateValueAndValidity();
    this.isHumanitarian = false;
  }

  showAndRequireMainDACCategory() {
    this.mainDACCategory.setValidators([CustomValidators.required]);
    this.mainDACCategory.updateValueAndValidity();
    this.isDevelopment = true;
  }

  get domain(): UntypedFormControl {
    return this.form.get('domain')! as UntypedFormControl;
  }

  get mainDACCategory(): UntypedFormControl {
    return this.form.get('mainDACCategory')! as UntypedFormControl;
  }

  get mainUNOCHACategory(): UntypedFormControl {
    return this.form.get('mainUNOCHACategory')! as UntypedFormControl;
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups().subscribe((list: Country[]) => {
      this.countries = list;
    });
  }

  destroyPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

}
