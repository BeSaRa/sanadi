import { CollectorItem } from '@app/models/collector-item';
import { CollectorApproval } from '@app/models/collector-approval';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { LicenseService } from '@app/services/license.service';
import { Observable, Subject } from 'rxjs';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DateUtils } from '@app/helpers/date-utils';
import { CollectorLicense } from '@app/license-models/collector-license';
import { exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { SelectedLicenseInfo } from '@app/interfaces/selected-license-info';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { LicenseDurationType } from '@app/enums/license-duration-type';
import { CustomValidators } from '@app/validators/custom-validators';
import { ServiceDataService } from '@app/services/service-data.service';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ServiceCustomSettings } from '@app/models/service-custom-settings';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { OperationTypes } from '@app/enums/operation-types.enum';

@Component({
  selector: 'app-collector-approval-popup',
  templateUrl: './collector-approval-popup.component.html',
  styleUrls: ['./collector-approval-popup.component.scss']
})
export class CollectorApprovalPopupComponent extends UiCrudDialogGenericComponent<CollectorItem> {
  popupTitleKey: keyof ILanguageKeys;
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'actions'];
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  relationships: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  oldLicenseFullSerialControl: UntypedFormControl = new UntypedFormControl();
  caseType: CaseTypes;
  collectorModel: CollectorApproval;
  datepickerOptionsMap: IKeyValue = {
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };
  isPermanent!: boolean;
  licenseSearch$: Subject<string> = new Subject<string>();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<CollectorItem>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    private licenseService: LicenseService,
    private lookupService: LookupService,
  ) {
    super();
    this.setInitDialogData(data);
    this.caseType = data.caseType!;
    this.popupTitleKey = 'collector_items';
    this.collectorModel = data.extras?.collectorModel;
  }

  getPopupHeadingText(): string {
    return '';
  }
  _getNewInstance(override?: Partial<CollectorItem> | undefined): CollectorItem {
    return new CollectorItem().clone(override ?? {});
  }
  _isDuplicate(record1: Partial<CollectorItem>, record2: Partial<CollectorItem>): boolean {
    return (record1 as CollectorItem).isEqual(record2 as CollectorItem);
  }
  initPopup(): void {
    this.listenToLicenseSearch();
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: CollectorItem, originalModel: CollectorItem): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: CollectorItem, form: UntypedFormGroup): boolean | Observable<boolean> {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.collectorModel.requestType !== CollectionRequestType.NEW && this.oldLicenseFullSerialControl.value) {
      this.selectedLicenseInvalidMessage()
      return false;
    }
    if (this.isDuplicateInList(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }
  private selectedLicenseInvalidMessage() {
    this.dialogService.error(this.lang.map.edit_cancel_request_need_exists_license);
  }
  prepareModel(model: CollectorItem, form: UntypedFormGroup): CollectorItem | Observable<CollectorItem> {
    let formValue = form.getRawValue();
    const row = this._getNewInstance({
      ...this.model,
      ...formValue
    });
    row.collectorTypeInfo = AdminResult.createInstance(this.collectorTypes.find(c => c.lookupKey == row?.collectorType)!);
    return row;
  }
  saveFail(error: Error): void {
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.toggleLicenseEndDate();
  }

  searchForLicense() {
    this.licenseSearch$.next(this.oldLicenseFullSerialField.value);
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.form && this.form.get('oldLicenseFullSerial')) as UntypedFormControl;
  }
  private openSelectLicense(licenses: CollectorLicense[]) {
    const licensesByDurationType = licenses.filter(l => l.licenseDurationTypeInfo.lookupKey == this.collectorModel.licenseDurationType);
    return this.licenseService.openSelectLicenseDialog(licensesByDurationType, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: CollectorLicense, details: CollectorLicense }>;
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectorSearch<CollectorApproval>({
            fullSerial: serial,
            licenseDurationType: this.collectorModel.licenseDurationType
          });
      }))
      .pipe(tap(licenses => !licenses.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>, SelectedLicenseInfo<CollectorLicense, CollectorLicense>>
          ((info): info is SelectedLicenseInfo<CollectorLicense, CollectorLicense> => !!info))
      .pipe(filter((license) => {
        let isAlreadyAdded = this.isLicenseAlreadyAdded(license.details);
        if (isAlreadyAdded) {
          this.dialogService.info(this.lang.map.x_already_exists.change({ x: this.lang.map.license }));
        }
        return !isAlreadyAdded;
      }))
      .subscribe((_info) => {
        this.updateForm(this.model = _info.details.convertToItem());
      });
  }

  isLicenseAlreadyAdded(selectedLicense: any): boolean {
    return this.collectorModel.collectorItemList.some(x => x.oldLicenseFullSerial === selectedLicense.fullSerial);
  }

  private validateSingleLicense(license: CollectorLicense): Observable<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>> {
    return this.licenseService.validateLicenseByRequestType<CollectorLicense>(this.collectorModel.caseType, this.collectorModel.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>);
      }));
  }
  isCancelRequestType(): boolean {
    return !!this.collectorModel && !!this.collectorModel.requestType && (this.collectorModel.requestType === CollectionRequestType.CANCEL);
  }
  isNewRequestType(): boolean {
    return !!this.collectorModel && !!this.collectorModel.requestType && (this.collectorModel.requestType === CollectionRequestType.NEW);
  }
  private updateForm(model: CollectorItem): void {
    this.form.patchValue(model.buildForm(false));
  }
  isEditLicenseEndDateDisabled(): boolean {
    return (this.isPermanent || !this.isNewRequestType() || this.readonly);
  }

  get licenseEndDate() {
    return this.form?.get('licenseEndDate');
  }

  private toggleLicenseEndDate() {
    this.isPermanent = this.collectorModel.licenseDurationType == LicenseDurationType.PERMANENT;
    const licenseEnDateValidator = this.isPermanent ? [] : [CustomValidators.required];
    this.licenseEndDate?.setValidators(licenseEnDateValidator);
    this.isPermanent && this.licenseEndDate?.disable();
    !this.isPermanent && this.licenseEndDate?.enable();
  }

  isSearchAllowed(): boolean {
    // if readonly or no request type or request type = new, edit is not allowed
    // if new or draft record, edit is allowed
    // if collection item is new, edit is allowed
    let isAllowed = false;
    if (this.readonly || !this.collectorModel.requestType || this.collectorModel.requestType === CollectionRequestType.NEW) {
      isAllowed = false;
    } else if (!this.collectorModel?.id || (!!this.collectorModel?.id && this.collectorModel.canCommit()) || !this.model!.itemId) {
      isAllowed = true;
    }
    !isAllowed ? this.oldLicenseFullSerialField.disable() : this.oldLicenseFullSerialField.enable()
    return isAllowed;
  }
}
