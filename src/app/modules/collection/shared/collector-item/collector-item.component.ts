import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {exhaustMap, filter, map, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {AppEvents} from '@app/enums/app-events';
import {CollectorApproval} from '@app/models/collector-approval';
import {CollectorItem} from '@app/models/collector-item';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {LicenseDurationType} from '@app/enums/license-duration-type';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@app/models/admin-result';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {LicenseService} from '@app/services/license.service';
import {SelectedLicenseInfo} from '@app/interfaces/selected-license-info';
import {CollectorLicense} from '@app/license-models/collector-license';

@Component({
  selector: 'collector-item',
  templateUrl: './collector-item.component.html',
  styleUrls: ['./collector-item.component.scss']
})
export class CollectorItemComponent implements OnInit, OnDestroy {
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'actions'];

  @Input()
  model!: CollectorApproval;
  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem, index: number }>();
  remove$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem; index: number }>();
  save$: Subject<null> = new Subject<null>();
  editIndex: number | undefined = undefined;
  item?: CollectorItem;
  form!: FormGroup;
  oldLicenseFullSerialControl: FormControl = new FormControl();
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  collectorRelations: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  relationships: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  isPermanent!: boolean;
  licenseSearch$: Subject<string> = new Subject<string>();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  datepickerOptionsMap: IKeyValue = {
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  private _licenseDurationType: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);

  get licenseDurationType(): number | undefined {
    return this._licenseDurationType.value;
  }

  @Input() set licenseDurationType(val: number | undefined) {
    this._licenseDurationType.next(val);
  }

  @Output()
  approval: EventEmitter<{ item: CollectorItem, index: number }> = new EventEmitter<{ item: CollectorItem; index: number }>();

  @Output()
  eventHappened: EventEmitter<AppEvents> = new EventEmitter<AppEvents>();
  @Output()
  formOpenedStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns: string[] = ['identificationNumber', 'arabicName', 'collectorType', 'jobTitle', 'actions'];
  @Input()
  approvalMode: boolean = false;

  @Input()
  disableAdd: boolean = false;

  private _disableSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  @Input()
  set disableSearch(val: boolean) {
    this._disableSearch.next(val);
  }

  get disableSearch(): boolean {
    return this._disableSearch.value;
  }

  private _requestType: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  @Input()
  set requestType(val: number | null) {
    console.log('requestType', val);
    this._requestType.next(val);
  }

  get requestType() {
    return this._requestType.value;
  }

  constructor(private fb: FormBuilder,
              public lang: LangService,
              private dialog: DialogService,
              private lookupService: LookupService,
              private collectorApprovalService: CollectorApprovalService,
              private licenseService: LicenseService) {
  }

  ngOnInit(): void {
    if (!this.model) {
      throw Error('Please Provide Model to get the Collector Items from it');
    }

    if (this.approvalMode) {
      const newColumns = this.columns.slice();
      newColumns.splice(this.columns.length - 1, 0, 'approval_info_status');
      this.columns = newColumns;
    }
    this.buildForm();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToRemove();
    this.listenToSave();
    this.listenToDisableSearchField();
    this.listenToLicenseDurationTypeChanges();
  }

  private buildForm(): void {
    this.form = this.fb.group((new CollectorItem().buildForm(true)));
  }

  private updateForm(model: CollectorItem): void {
    this.form.patchValue(model.buildForm(false));
  }

  private resetForm(): void {
    this.form.reset();
  }

  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.item = new CollectorItem().clone<CollectorItem>({
        licenseDurationType: this.model.licenseDurationType
      })))
      .subscribe(() => this.formOpenedStatus.emit(true));
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
      .subscribe(() => this.formOpenedStatus.emit(true));
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
            };
          }));
      }))
      .subscribe((info) => {
        info.click === UserClickOn.YES ? this.processDelete(info.index) : null;
      });
  }

  private listenToDisableSearchField() {
    this._disableSearch
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        value ? this.oldLicenseFullSerialField.disable() : this.oldLicenseFullSerialField.enable();
      });
  }

  private listenToSave(): void {
    this.save$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(() => of(this.form.valid)))
      .pipe(tap(valid => !valid && this.formInvalidMessage()))
      .pipe(filter(valid => valid))
      .subscribe(() => {
        this.processSave(new CollectorItem().clone<CollectorItem>({
          ...this.item,
          ...this.form.value
        }));
      });
  }

  private processSave(item: CollectorItem): void {
    item.collectorTypeInfo = AdminResult.createInstance(this.collectorTypes.find(c => c.lookupKey == item?.collectorType)!);
    this.editIndex ? this.processEdit(item) : this.processAdd(item);
    this.cancel();
  }

  private processAdd(item: CollectorItem): void {
    this.model.collectorItemList = this.model.collectorItemList.concat([item]);
    this.eventHappened.emit(AppEvents.ADD);
  }

  private processEdit(item: CollectorItem): void {
    this.model.collectorItemList.splice((this.editIndex!) - 1, 1, item);
    this.model.collectorItemList = [...this.model.collectorItemList];
    this.eventHappened.emit(AppEvents.EDIT);
  }

  private processDelete(index: number): void {
    this.model.collectorItemList.splice(index, 1);
    this.model.collectorItemList = [...this.model.collectorItemList];
    this.eventHappened.emit(AppEvents.DELETE);
  }

  private formInvalidMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    this.form.markAllAsTouched();
  }

  cancel(): void {
    this.item = undefined;
    this.editIndex = undefined;
    this.resetForm();
    this.formOpenedStatus.emit(false);
  }

  private toggleLicenseEndDate() {
    this.isPermanent = this.licenseDurationType == LicenseDurationType.PERMANENT;
    const licenseEnDateValidator = this.isPermanent ? [] : [CustomValidators.required];
    this.licenseEndDate?.setValidators(licenseEnDateValidator);
    this.isPermanent && this.licenseEndDate?.disable();
    !this.isPermanent && this.licenseEndDate?.enable();
  }

  get licenseEndDate() {
    return this.form?.get('licenseEndDate');
  }

  get oldLicenseFullSerialField(): FormControl {
    return (this.form.get('oldLicenseFullSerial')) as FormControl;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToLicenseDurationTypeChanges() {
    this._licenseDurationType
      .pipe(takeUntil(this.destroy$))
      .pipe(skip(1))
      .subscribe(() => {
        this.toggleLicenseEndDate();
      });
  }

  private validateSingleLicense(license: CollectorLicense): Observable<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>> {
    return this.licenseService.validateLicenseByRequestType<CollectorLicense>(this.model.caseType, this.model.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>);
      }))
  }

  private openSelectLicense(licenses: CollectorLicense[]) {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: CollectorLicense, details: CollectorLicense }>
  }

  searchForLicense() {
    if (!this.oldLicenseFullSerialField.value) {
      this.dialog.error(this.lang.map.need_license_number_to_search);
      return;
    }

    this.licenseService
      .collectorSearch<CollectorApproval>({
        fullSerial: this.oldLicenseFullSerialField.value
      })
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>, SelectedLicenseInfo<CollectorLicense, CollectorLicense>>
        ((info): info is SelectedLicenseInfo<CollectorLicense, CollectorLicense> => !!info))
      .subscribe((_info) => {
        this.updateForm(this.item = _info.details.convertToItem());
      })
  }
}
