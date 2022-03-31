import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CollectionApproval} from "@app/models/collection-approval";
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {CollectionItem} from "@app/models/collection-item";
import {AbstractControl, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {LangService} from "@app/services/lang.service";
import {AppEvents} from "@app/enums/app-events";
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ICoordinates} from "@app/interfaces/ICoordinates";
import {LicenseService} from "@app/services/license.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {CollectionLicense} from "@app/license-models/collection-license";
import {HasCollectionItemBuildForm} from "@app/interfaces/has-collection-item-build-form";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {BuildingPlateComponent} from '@app/shared/components/building-plate/building-plate.component';

@Component({
  selector: 'collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss']
})
export class CollectionItemComponent implements OnInit, OnDestroy {
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'ouInfo', 'creatorInfo', 'actions'];

  constructor(private fb: FormBuilder,
              public lang: LangService,
              private licenseService: LicenseService,
              private dialog: DialogService) {
  }

  @Input()
  model!: CollectionApproval
  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem, index: number }>();
  remove$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem; index: number }>();
  save$: Subject<null> = new Subject<null>();

  editIndex: number | undefined = undefined;

  item?: CollectionItem;

  form!: FormGroup;

  searchControl: FormControl = new FormControl();

  @Output()
  approval: EventEmitter<{ item: CollectionItem, index: number }> = new EventEmitter<{ item: CollectionItem; index: number }>();

  @Output()
  eventHappened: EventEmitter<AppEvents> = new EventEmitter<AppEvents>();
  @Output()
  formOpenedStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns: string[] = ['identificationNumber', 'zoneNumber', 'streetNumber', 'buildingNumber', 'unitNumber', 'map', 'actions'];
  @Input()
  approvalMode: boolean = false;

  @Input()
  disableAdd: boolean = false;

  licenseSearch$: Subject<string> = new Subject<string>();

  private _disableSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @ViewChild('buildingPlate') buildingPlate!: BuildingPlateComponent;

  @Input()
  set disableSearch(val: boolean) {
    this._disableSearch.next(val);
  }

  get disableSearch(): boolean {
    return this._disableSearch.value;
  }


  get longitude(): AbstractControl {
    return this.form.get('longitude')!
  }

  get latitude(): AbstractControl {
    return this.form.get('latitude')!
  }

  get oldLicenseFullSerial(): AbstractControl {
    return this.form.get('oldLicenseFullSerial')!;
  }

  ngOnInit(): void {
    if (!this.model) {
      throw Error('Please Provide Model to get the Collection Items from it')
    }

    if (this.approvalMode) {
      const newColumns = this.columns.slice()
      newColumns.splice(this.columns.length - 1, 0, 'approval_info_status');
      this.columns = newColumns;
    }
    this.buildForm();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToRemove();
    this.listenToSave();
    this.listenToDisableSearchField();
    this.listenToLicenseSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.item = new CollectionItem().clone<CollectionItem>({
        licenseDurationType: this.model.licenseDurationType,
        requestClassification: this.model.requestClassification
      })))
      .subscribe(() => this.formOpenedStatus.emit(true))
  }

  private listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        // always add one here to the selected index to avoid the if condition while process save
        this.editIndex = (++info.index);
        this.item = info.item;
        this.updateForm(this.item);
      }))
      .subscribe(() => this.formOpenedStatus.emit(true))
  }

  private listenToRemove() {
    this.remove$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(info => {
        return this.dialog
          .confirm(this.lang.map.msg_confirm_delete_x.change({x: info.item.identificationNumber}))
          .onAfterClose$.pipe(map((click: UserClickOn) => {
            return {
              index: info.index,
              click
            }
          }))
      }))
      .subscribe((info) => {
        info.click === UserClickOn.YES ? this.processDelete(info.index) : null;
      })
  }

  private buildForm(): void {
    this.form = this.fb.group((new CollectionItem().buildForm(true)));
  }

  private updateForm(model: HasCollectionItemBuildForm): void {
    this.form.patchValue(model.buildForm(false));
  }

  private resetForm(): void {
    this.form.reset();
  }

  private listenToDisableSearchField() {
    this._disableSearch
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.oldLicenseFullSerial.disable();
        value ? this.searchControl.disable() : this.searchControl.enable();
        this.searchControl.setValidators(value ? [] : CustomValidators.required);
        value ? this.oldLicenseFullSerial.setValidators([]) : this.oldLicenseFullSerial.setValidators(CustomValidators.required);
      })
  }

  private listenToSave(): void {
    this.save$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(_ => this.validateForm()))
      .pipe(filter(valid => valid))
      .subscribe(() => {
        this.processSave(new CollectionItem().clone({
          ...this.item,
          ...this.form.value,
          ...this.buildingPlate.getValue()
        }))
      })
  }

  private processSave(item: CollectionItem): void {
    this.editIndex ? this.processEdit(item) : this.processAdd(item);
    this.cancel();
  }

  private processAdd(item: CollectionItem): void {
    this.model.collectionItemList = this.model.collectionItemList.concat([item]);
    this.eventHappened.emit(AppEvents.ADD)
  }

  private processEdit(item: CollectionItem): void {
    this.model.collectionItemList.splice((this.editIndex!) - 1, 1, item);
    this.model.collectionItemList = [...this.model.collectionItemList];
    this.eventHappened.emit(AppEvents.EDIT)
  }

  private processDelete(index: number): void {
    this.model.collectionItemList.splice(index, 1)
    this.model.collectionItemList = [...this.model.collectionItemList];
    this.eventHappened.emit(AppEvents.DELETE);
  }

  private formInvalidMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    this.form.markAllAsTouched();
    this.buildingPlate.displayFormValidity();
  }

  openLocationMap(item: CollectionItem) {
    item.openMap(true);
  }

  private validateSingleLicense(license: CollectionLicense): Observable<undefined | CollectionLicense> {
    return this.licenseService.validateLicenseByRequestType<CollectionLicense>(this.model.caseType, this.model.requestType, license.id) as Observable<undefined | CollectionLicense>
  }

  private openSelectLicense(licenses: CollectionLicense[]): Observable<undefined | CollectionLicense> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: CollectionLicense, details: CollectionLicense } | undefined)) => result ? result.details : result))
  }

  searchForLicense() {
    this.licenseSearch$.next(this.searchControl.value);
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(val => !!val))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectionSearch<CollectionApproval>({
            fullSerial: serial,
            requestClassification: this.model.requestClassification
          })
      }))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(filter((info): info is CollectionLicense => !!info))
      .subscribe((license) => {
        this.searchControl.patchValue(license.fullSerial);
        this.item = license.convertToCollectionItem();
        this.updateForm(this.item);
      })
  }

  cancel(): void {
    this.item = undefined;
    this.editIndex = undefined;
    this.resetForm();
    this.formOpenedStatus.emit(false);
  }

  openMapMarker() {
    (this.item!).openMap()
      .onAfterClose$
      .subscribe(({click, value}: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.item!.latitude = value.latitude;
          this.item!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      })
  }

  private validateForm(): Observable<boolean> {
    return of(this.form.valid && this.buildingPlate.isValidForm())
      .pipe(tap(valid => !valid && this.formInvalidMessage()))
      .pipe(filter((val) => val)) // allow only the valid form
      .pipe(map(_ => !(!this.latitude.value || !this.longitude.value))) // if no lat/lng return false
      .pipe(tap(validLatLong => !validLatLong && this.longitudeLatitudeInvalidMessage()))
      .pipe(filter((val) => val)) // allow only the valid form
      .pipe(tap(_ => console.log(this.model.requestType, ServiceRequestTypes.NEW)))
      .pipe(map(_ => ((this.model.requestType !== ServiceRequestTypes.NEW) ? this.oldLicenseFullSerial.value : true)))
      .pipe(tap(validSelected => (!validSelected && this.selectedLicenseInvalidMessage())))
      .pipe(filter((val) => val)) // allow only the valid form
  }

  private longitudeLatitudeInvalidMessage() {
    this.dialog.error(this.lang.map.longitude_latitude_required)
  }

  private selectedLicenseInvalidMessage() {
    this.dialog.error(this.lang.map.edit_cancel_request_need_exists_license)
  }
}
