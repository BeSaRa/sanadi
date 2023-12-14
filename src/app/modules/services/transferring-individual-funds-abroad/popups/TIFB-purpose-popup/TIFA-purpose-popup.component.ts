import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DomainTypes } from '@app/enums/domain-types';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { Lookup } from '@app/models/lookup';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { UiCrudDialogGenericComponent } from "@app/generics/ui-crud-dialog-generic-component.directive";
import { UiCrudDialogComponentDataContract } from "@contracts/ui-crud-dialog-component-data-contract";
import { CountryService } from "@services/country.service";
import { ILanguageKeys } from "@contracts/i-language-keys";
import { OperationTypes } from "@enums/operation-types.enum";
import { Observable } from "rxjs";
import { Country } from "@models/country";
import { LookupService } from "@services/lookup.service";
import { CommonUtils } from '@app/helpers/common-utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-TIFA-purpose-popup',
  templateUrl: './TIFA-purpose-popup.component.html',
  styleUrls: ['./TIFA-purpose-popup.component.scss']
})
export class TIFAPurposePopupComponent extends UiCrudDialogGenericComponent<TransferFundsCharityPurpose> {
  popupTitleKey: keyof ILanguageKeys;
  isCancel: boolean = false;
  countries: Country[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<TransferFundsCharityPurpose>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    private dacOchaService: DacOchaService,
    private lookupService: LookupService,
    private countryService: CountryService) {
    super();
    this.setInitDialogData(data);
    this.isCancel = (data.extras && data.extras.isCancel) ?? false;
    this.countries = data.extras?.countries ?? [];
    this.popupTitleKey = 'purpose';
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

  _isDuplicate(record1: Partial<TransferFundsCharityPurpose>, record2: Partial<TransferFundsCharityPurpose>): boolean {
    return (record1 as TransferFundsCharityPurpose).isEqual(record2 as TransferFundsCharityPurpose);
  }

  beforeSave(model: TransferFundsCharityPurpose, form: UntypedFormGroup): Observable<boolean> | boolean {
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
    this.dacOchaService.loadMainDacOcha()
    .pipe(
      map(list => list.filter(x=>x.isActive() && x.type === DomainTypes.HUMANITARIAN) )
    )
    .subscribe(list => {

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
    this.dacOchaService.loadMainDacOcha()
    .pipe(
      map(list => list.filter(x=>x.isActive() && x.type === DomainTypes.DEVELOPMENT) )
    )
    .subscribe(list => {
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
