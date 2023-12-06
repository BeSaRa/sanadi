import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { ExecutiveManagement } from '@app/models/executive-management';
import { Lookup } from '@app/models/lookup';
import { CountryService } from '@app/services/country.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomValidators } from "@app/validators/custom-validators";
import { CaseTypes } from '@app/enums/case-types.enum';

@Component({
  selector: 'executive-management-popup',
  templateUrl: './executive-management-popup.component.html',
  styleUrls: ['./executive-management-popup.component.scss']
})
export class ExecutiveManagementPopupComponent extends UiCrudDialogGenericComponent<ExecutiveManagement> {
  popupTitleKey: keyof ILanguageKeys;
  pageTitle: keyof ILanguageKeys;
  hidePassport: boolean;
  hideQId: boolean;
  caseType?: CaseTypes;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  countriesList: Country[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ExecutiveManagement>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    private lookupService: LookupService,
    private countryService: CountryService) {
    super();
    this.setInitDialogData(data);
    this.pageTitle = (data.extras && data.extras.pageTitle) ?? 'managers';
    this.hidePassport = (data.extras && data.extras.hidePassport);
    this.hideQId = (data.extras && data.extras.hideQId);
    this.popupTitleKey = this.pageTitle;
    this.caseType = data.caseType
  }

  _getNewInstance(override?: Partial<ExecutiveManagement> | undefined): ExecutiveManagement {
    return new ExecutiveManagement().clone(override ?? {});
  }

  initPopup(): void {
    /*this.loadCountries();*/
  }

  getPopupHeadingText(): string {
    return '';
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ExecutiveManagement, originalModel: ExecutiveManagement): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<ExecutiveManagement>, record2: Partial<ExecutiveManagement>): boolean {
    return (record1 as ExecutiveManagement).isEqual(record2 as ExecutiveManagement);
  }

  beforeSave(model: ExecutiveManagement, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: ExecutiveManagement, form: UntypedFormGroup): ExecutiveManagement | Observable<ExecutiveManagement> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      nationalityInfo: this.nationalities.find((x) => x.id === formValue.Nationality)?.createAdminResult() ?? new AdminResult(),
    });
  }

  isArabicNameRequired():boolean{
    return this.caseType === this.caseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL;
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  get arabicNameField(): UntypedFormControl {
    return (this.form.get('arabicName')) as UntypedFormControl;
  }
  get nationalityField(): UntypedFormControl {
    return (this.form.get('nationality')) as UntypedFormControl;
  }
  get getQidField(): UntypedFormControl {
    return (this.form.get('identificationNumber')) as UntypedFormControl;
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.getManagerFields(true));
    (this.model)
    if (this.isArabicNameRequired()) {
      this.arabicNameField.setValidators([CustomValidators.required, CustomValidators.pattern('AR_ONLY'),
                                          CustomValidators.maxLength(100),
                                          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
    ])
    this.arabicNameField.setValue(this.model.arabicName)
    }
    if (this.nationalities.length) {
      this.nationalityField.setValidators([CustomValidators.required])
    }
    if (!this.hideQId) {
      this.getQidField.setValidators([this.customValidators.required])
    }
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
  }
}
