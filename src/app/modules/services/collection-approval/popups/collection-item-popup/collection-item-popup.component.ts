import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, AbstractControl, UntypedFormControl } from '@angular/forms';
import { CollectionItem } from '@app/models/collection-item';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, Subject } from 'rxjs';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { UiCrudDialogComponentDataContract } from '@contracts/ui-crud-dialog-component-data-contract';
import { CaseTypes } from '@enums/case-types.enum';
import { OperationTypes } from '@enums/operation-types.enum';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { LicenseService } from '@services/license.service';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { CollectionApproval } from '@app/models/collection-approval';
import { CollectionLicense } from '@app/license-models/collection-license';
import { HasCollectionItemBuildForm } from '@app/interfaces/has-collection-item-build-form';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ICoordinates } from '@app/interfaces/ICoordinates';
import { BuildingPlateComponent } from '@app/shared/components/building-plate/building-plate.component';
import { DatepickerOptionsMap } from '@app/types/types';
import { DateUtils } from '@app/helpers/date-utils';
import { LicenseDurationType } from '@app/enums/license-duration-type';
import { CommonUtils } from '@app/helpers/common-utils';

@Component({
  selector: 'app-collection-item-popup',
  templateUrl: './collection-item-popup.component.html',
  styleUrls: ['./collection-item-popup.component.scss']
})
export class CollectionItemPopupComponent extends UiCrudDialogGenericComponent<CollectionItem> {
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'ouInfo', 'creatorInfo', 'actions'];
  popupTitleKey: keyof ILanguageKeys;
  caseType: CaseTypes;
  collectionModel: CollectionApproval;
  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
  };
  licenseSearch$: Subject<string> = new Subject<string>();

  searchControl: UntypedFormControl = new UntypedFormControl();
  @ViewChild('buildingPlate') buildingPlate!: BuildingPlateComponent;
  get oldLicenseFullSerial(): UntypedFormControl {
    return this.form.get('oldLicenseFullSerial') as UntypedFormControl;
  };

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<CollectionItem>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    private licenseService: LicenseService
  ) {
    super();
    this.setInitDialogData(data);
    this.caseType = data.caseType!;
    this.popupTitleKey = 'collection_items';
    this.collectionModel = data.extras?.collectionModel;
  }

  _getNewInstance(override: Partial<CollectionItem> | undefined): CollectionItem {
    return new CollectionItem().clone(override ?? {});
  }

  _isDuplicate(record1: Partial<CollectionItem>, record2: Partial<CollectionItem>): boolean {
    return (record1 as CollectionItem).isEqual(record2 as CollectionItem);
  }

  afterSave(savedModel: CollectionItem, originalModel: CollectionItem): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: CollectionItem, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isInvalidLatitudeLongitude()) {
      this.longitudeLatitudeInvalidMessage();
      return false;
    }
    if (!this.buildingPlate || this.buildingPlate.form.invalid) {
      this.formInvalidMessage();
      return false;
    }
    if (this.collectionModel.requestType !== CollectionRequestType.NEW && !this.oldLicenseFullSerial.value) {
      this.selectedLicenseInvalidMessage()
      return false;
    }
    if (this.isDuplicateInList(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.oldLicenseFullSerial.disable();
    this.licenseEndDate.setValidators(this.collectionModel.licenseDurationType === LicenseDurationType.TEMPORARY ? [CustomValidators.required] : null);
  }

  destroyPopup(): void {
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
    this.listenToLicenseSearch();
  }

  searchForLicense() {
    this.licenseSearch$.next(this.searchControl.value);
  }

  get longitude(): AbstractControl {
    return this.form.get('longitude')!;
  }

  get latitude(): AbstractControl {
    return this.form.get('latitude')!;
  }

  isSearchAllowed(): boolean {
    // if readonly or no request type or request type = new, edit is not allowed
    // if new or draft record, edit is allowed
    // if collection item is new, edit is allowed
    let isAllowed = false;
    if (this.readonly || !this.collectionModel.requestType || this.collectionModel.requestType === CollectionRequestType.NEW) {
      isAllowed = false;
    } else if (!this.collectionModel?.id || (!!this.collectionModel?.id && this.collectionModel.canCommit()) || !this.model!.itemId) {
      isAllowed = true;
    }
    !isAllowed ? this.searchControl.disable() : this.searchControl.enable();
    this.searchControl.setValidators(!isAllowed ? [] : CustomValidators.required);
    this.oldLicenseFullSerial.setValidators(!isAllowed ? [] : CustomValidators.required);
    this.searchControl.updateValueAndValidity();
    this.oldLicenseFullSerial.updateValueAndValidity();
    return isAllowed;
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectionSearch<CollectionApproval>({
            fullSerial: serial,
            requestClassification: this.collectionModel.requestClassification,
            licenseDurationType: this.collectionModel.licenseDurationType
          });
      }))
      .pipe(tap(licenses => !licenses.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(filter((info): info is CollectionLicense => !!info))
      .pipe(filter((license) => {
        let isAlreadyAdded = this.isLicenseAlreadyAdded(license);
        if (isAlreadyAdded) {
          this.dialogService.info(this.lang.map.x_already_exists.change({ x: this.lang.map.license }));
        }
        return !isAlreadyAdded;
      }))
      .subscribe((license) => {
        this.searchControl.patchValue(license.fullSerial);
        this.model = license.convertToCollectionItem();
        this.updateForm(this.model);
      });
  }
  prepareModel(model: CollectionItem, form: UntypedFormGroup): Observable<CollectionItem> | CollectionItem {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
      ...this.buildingPlate.getValue()
    });
  }

  isLicenseAlreadyAdded(selectedLicense: any): boolean {
    return this.collectionModel.collectionItemList.some(x => x.oldLicenseFullSerial === selectedLicense.fullSerial);
  }
  saveFail(error: Error): void {
  }
  private validateSingleLicense(license: CollectionLicense): Observable<undefined | CollectionLicense> {
    return this.licenseService.validateLicenseByRequestType<CollectionLicense>(this.collectionModel.caseType, this.collectionModel.requestType, license.id) as Observable<undefined | CollectionLicense>;
  }

  private openSelectLicense(licenses: CollectionLicense[]): Observable<undefined | CollectionLicense> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.collectionModel, true, this.displayedColumns)
      .onAfterClose$
      .pipe(map((result: ({
        selected: CollectionLicense,
        details: CollectionLicense
      } | undefined)) => result ? result.details : result));
  }

  private updateForm(model: HasCollectionItemBuildForm): void {
    this.form.patchValue(model.buildForm(false));
  }
  openMapMarker() {
    (this.model!).openMap(this.isCancelRequestType() || this.readonly)
      .onAfterClose$
      .subscribe(({ click, value }: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.model!.latitude = value.latitude;
          this.model!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      });
  }
  isNewRequestType(): boolean {
    return !!this.collectionModel && !!this.collectionModel.requestType && (this.collectionModel.requestType === CollectionRequestType.NEW);
  }

  isCancelRequestType(): boolean {
    return !!this.collectionModel && !!this.collectionModel.requestType && (this.collectionModel.requestType === CollectionRequestType.CANCEL);
  }

  isTemporaryLicenseDuration(): boolean {
    return this.collectionModel.licenseDurationType === LicenseDurationType.TEMPORARY;
  }

  isEditLicenseEndDateDisabled(): boolean {
    return !this.isNewRequestType() || this.readonly;
  }


  get licenseEndDate(): AbstractControl {
    return this.form && this.form.get('licenseEndDate')!;
  }
  private formInvalidMessage(): void {
    this.dialogService.error(this.lang.map.msg_all_required_fields_are_filled);
    this.form.markAllAsTouched();
    this.buildingPlate.displayFormValidity();
  }

  private isInvalidLatitudeLongitude(): boolean {
    return !this.form
      || !CommonUtils.isValidValue(this.latitude.value)
      || !CommonUtils.isValidValue(this.longitude.value);
  }
  private longitudeLatitudeInvalidMessage() {
    this.dialogService.error(this.lang.map.longitude_latitude_required);
  }
  private selectedLicenseInvalidMessage() {
    this.dialogService.error(this.lang.map.edit_cancel_request_need_exists_license);
  }
}
