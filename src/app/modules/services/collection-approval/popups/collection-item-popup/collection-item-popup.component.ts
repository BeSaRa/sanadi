import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ICoordinates } from '@app/interfaces/ICoordinates';
import { CollectionItem } from '@app/models/collection-item';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DateUtils } from '@app/helpers/date-utils';
import { DatepickerOptionsMap } from '@app/types/types';
import { CollectionApproval } from '@app/models/collection-approval';
import { LicenseDurationType } from '@app/enums/license-duration-type';
import { Observable, Subject } from 'rxjs';
import { exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { LicenseService } from '@app/services/license.service';
import { CollectionLicense } from '@app/license-models/collection-license';
import { DialogService } from '@app/services/dialog.service';
import { HasCollectionItemBuildForm } from '@app/interfaces/has-collection-item-build-form';
import { CustomValidators } from '@app/validators/custom-validators';
import { BuildingPlateComponent } from '@app/shared/components/building-plate/building-plate.component';

@Component({
  selector: 'app-collection-item-popup',
  templateUrl: './collection-item-popup.component.html',
  styleUrls: ['./collection-item-popup.component.scss']
})
export class CollectionItemPopupComponent implements OnInit, OnDestroy {
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'ouInfo', 'creatorInfo', 'actions'];
  item!: CollectionItem;
  model: CollectionApproval;
  form: UntypedFormGroup;
  readOnly: boolean;
  viewOnly: boolean;
  editIndex: number;
  searchControl: UntypedFormControl = new UntypedFormControl();
  destroy$: Subject<any> = new Subject<any>();
  @ViewChild('buildingPlate') buildingPlate!: BuildingPlateComponent;

  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
  };
  licenseSearch$: Subject<string> = new Subject<string>();
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readOnly: boolean,
      viewOnly: boolean,
      editIndex: number,
      item: CollectionItem,
      model: CollectionApproval,
      oldLicenseFullSerial: UntypedFormControl,
    },
    public lang: LangService,
    private dialogRef: DialogRef,
    private dialog: DialogService,
    private licenseService: LicenseService
  ) {
    this.form = data.form;
    this.readOnly = data.readOnly;
    this.viewOnly = data.viewOnly;
    this.editIndex = data.editIndex;
    this.item = data.item;
    this.model = data.model;
  }

  ngOnInit() {
    this.listenToLicenseSearch();
    this.updateForm(this.item);
  }

  searchForLicense() {
    this.licenseSearch$.next(this.searchControl.value);
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectionSearch<CollectionApproval>({
            fullSerial: serial,
            requestClassification: this.model.requestClassification,
            licenseDurationType: this.model.licenseDurationType
          });
      }))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(filter((info): info is CollectionLicense => !!info))
      .pipe(filter((license) => {
        let isAlreadyAdded = this.isLicenseAlreadyAdded(license);
        if (isAlreadyAdded) {
          this.dialog.info(this.lang.map.x_already_exists.change({ x: this.lang.map.license }));
        }
        return !isAlreadyAdded;
      }))
      .subscribe((license) => {
        this.searchControl.patchValue(license.fullSerial);
        this.item = license.convertToCollectionItem();
        this.updateForm(this.item);
      });
  }
  isLicenseAlreadyAdded(selectedLicense: any): boolean {
    return this.model.collectionItemList.some(x => x.oldLicenseFullSerial === selectedLicense.fullSerial);
  }
  private validateSingleLicense(license: CollectionLicense): Observable<undefined | CollectionLicense> {
    return this.licenseService.validateLicenseByRequestType<CollectionLicense>(this.model.caseType, this.model.requestType, license.id) as Observable<undefined | CollectionLicense>;
  }
  private openSelectLicense(licenses: CollectionLicense[]): Observable<undefined | CollectionLicense> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: CollectionLicense, details: CollectionLicense } | undefined)) => result ? result.details : result));
  }

  private updateForm(model: HasCollectionItemBuildForm): void {
    this.form.patchValue(model.buildForm(false));
  }
  openMapMarker() {
    (this.item!).openMap(this.isCancelRequestType() || this.readOnly || this.viewOnly)
      .onAfterClose$
      .subscribe(({ click, value }: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.item!.latitude = value.latitude;
          this.item!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      });
  }

  isNewRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.NEW);
  }
  isCancelRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.CANCEL);
  }
  isTemporaryLicenseDuration(): boolean {
    return this.item!.licenseDurationType === LicenseDurationType.TEMPORARY;
  }

  isEditLicenseEndDateDisabled(): boolean {
    return !this.isNewRequestType() || this.readOnly || this.viewOnly;
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
    if (this.readOnly || this.viewOnly || !this.model.requestType || this.model.requestType === CollectionRequestType.NEW) {
      isAllowed = false;
    } else if (!this.model?.id || (!!this.model?.id && this.model.canCommit()) || !this.item!.itemId) {
      isAllowed = true;
    }
    !isAllowed ? this.searchControl.disable() : this.searchControl.enable();
    this.searchControl.setValidators(!isAllowed ? [] : CustomValidators.required);
    this.data.oldLicenseFullSerial.setValidators(!isAllowed ? [] : CustomValidators.required);
    this.searchControl.updateValueAndValidity();
    this.data.oldLicenseFullSerial.updateValueAndValidity();
    return isAllowed;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close({
      item: this.item,
      buildingPlate: this.buildingPlate
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
