import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DomainTypes } from '@app/enums/domain-types';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { Lookup } from '@app/models/lookup';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';
import { CountryService } from '@app/services/country.service';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-TIFA-purpose-popup',
  templateUrl: './TIFA-purpose-popup.component.html',
  styleUrls: ['./TIFA-purpose-popup.component.scss']
})
export class TIFAPurposePopupComponent extends UiCrudDialogGenericComponent<TransferFundsCharityPurpose> {
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  model: TransferFundsCharityPurpose;
  countries: Country[] = [];
  mainOchas: AdminLookup[] = [];
  mainDacs: AdminLookup[] = [];
  isHumanitarian = true;
  isDevelopment = true;
  isCancel!:boolean;

  projectTypes: Lookup[] = this.lookupService.listByCategory.InternalProjectType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  domains: Lookup[] = this.lookupService.listByCategory.Domain
    .sort((a, b) => a.lookupKey - b.lookupKey);

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<TransferFundsCharityPurpose>,
  public lang: LangService,
  public dialogRef: DialogRef,
  public dialogService: DialogService,
  public fb: UntypedFormBuilder,
  public toast: ToastService,
  private dacOchaService:DacOchaService,
  private lookupService: LookupService,
  private countryService:CountryService) {
  super();
  this.model = data.model;
  this.operation = data.operation;
  this.list = data.list;
  this.isCancel = (data.extras && data.extras.isCancel) ?? false;
  }
  _getNewInstance(override?: Partial<TransferFundsCharityPurpose> | undefined): TransferFundsCharityPurpose {
    return new TransferFundsCharityPurpose().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'purpose';
    this.listenToDomainChanges();
    this.countryService.loadAsLookups().subscribe((list: Country[]) => {
      this.countries = list;
    });
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: TransferFundsCharityPurpose, originalModel: TransferFundsCharityPurpose): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: TransferFundsCharityPurpose, form: UntypedFormGroup): Observable<boolean> | boolean {
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
  prepareModel(model: TransferFundsCharityPurpose, form: UntypedFormGroup): TransferFundsCharityPurpose | Observable<TransferFundsCharityPurpose> {
    let formValue = form.getRawValue();
    let projectTypeInfo = this.projectTypes.find(x => x.lookupKey == formValue.projectType)?.createAdminResult()?? new AdminResult();
    let domainInfo = this.domains.find(x => x.lookupKey == formValue.domain)?.createAdminResult()?? new AdminResult();
    let mainUNOCHACategoryInfo = this.mainOchas.find(x => x.id == formValue.mainUNOCHACategory)?.createAdminResult()?? new AdminResult();
    let mainDACCategoryInfo = this.mainDacs.find(x => x.id == formValue.mainDACCategory)?.createAdminResult()?? new AdminResult();
    let beneficiaryCountryInfo = this.countries.find(x => x.id == formValue.beneficiaryCountry)?.createAdminResult()?? new AdminResult();
    let executionCountryInfo = this.countries.find(x => x.id == formValue.executionCountry)?.createAdminResult()?? new AdminResult();

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
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }


  listenToDomainChanges() {    
    this.domain.valueChanges.subscribe(val => {
      if (val === DomainTypes.HUMANITARIAN) {
        this.showAndRequireMainUNOCHACategory();
        this.hideAndDontRequireMainDACCategory();
        this.loadOchas();
      } else if (val === DomainTypes.DEVELOPMENT) {
        this.hideAndDontRequireMainUNOCHACategory();
        this.showAndRequireMainDACCategory();
        this.loadDacs();
      } else {
        this.showAndDontRequireMainUNOCHACategory();
        this.showAndDontRequireMainDACCategory();
      }
    });
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

  loadOchas() {
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

  loadDacs() {
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

}
