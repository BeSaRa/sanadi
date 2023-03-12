import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {exhaustMap, filter, map, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {UserClickOn} from '@enums/user-click-on.enum';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {AppEvents} from '@enums/app-events';
import {CollectorApproval} from '@models/collector-approval';
import {CollectorItem} from '@models/collector-item';
import {Lookup} from '@models/lookup';
import {LookupService} from '@services/lookup.service';
import {IKeyValue} from '@contracts/i-key-value';
import {DateUtils} from '@helpers/date-utils';
import {LicenseDurationType} from '@enums/license-duration-type';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from '@models/admin-result';
import {CollectorApprovalService} from '@services/collector-approval.service';
import {LicenseService} from '@services/license.service';
import {SelectedLicenseInfo} from '@contracts/selected-license-info';
import {CollectorLicense} from '@app/license-models/collector-license';
import {CollectionRequestType} from '@enums/service-request-types';
import {ServiceDataService} from '@services/service-data.service';
import {CaseTypes} from '@enums/case-types.enum';
import {ServiceCustomSettings} from '@models/service-custom-settings';
import {SharedService} from '@services/shared.service';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@enums/action-icons-enum';
import {CollectionItem} from '@models/collection-item';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {HasAttachmentHandlerDirective} from '@app/shared/directives/has-attachment-handler.directive';
import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';

@Component({
  selector: 'collector-item',
  templateUrl: './collector-item.component.html',
  styleUrls: ['./collector-item.component.scss']
})
export class CollectorItemComponent extends HasAttachmentHandlerDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(AttachmentHandlerDirective) attachmentHandlerDirective?: AttachmentHandlerDirective;
  @Output() attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective> = new EventEmitter<AttachmentHandlerDirective>();

  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'actions'];

  @Input()
  model!: CollectorApproval;

  @Input() readOnly: boolean = false;

  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem, index: number }>();
  remove$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem; index: number }>();
  view$: Subject<{ item: CollectorItem, index: number }> = new Subject<{ item: CollectorItem; index: number }>();
  save$: Subject<null> = new Subject<null>();
  editIndex: number | undefined = undefined;
  item?: CollectorItem;
  form!: UntypedFormGroup;
  oldLicenseFullSerialControl: UntypedFormControl = new UntypedFormControl();
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  relationships: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  isPermanent!: boolean;
  licenseSearch$: Subject<string> = new Subject<string>();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  datepickerOptionsMap: IKeyValue = {
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };
  viewOnly: boolean = false;

  actions: IMenuItem<CollectorItem>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CollectorItem, index: number) => this.view$.next({item: item, index: index}),
      show: () => !this.approvalMode && this.readOnly
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem, index: number) => this.edit$.next({item: item, index: index}),
      show: () => !this.approvalMode,
      disabled: () => this.readOnly
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE_TRASH,
      onClick: (item: CollectorItem, index: number) => this.remove$.next({item: item, index: index}),
      show: () => !this.approvalMode,
      disabled: () => this.readOnly
    },
    // edit approval info (if approval mode)
    {
      type: 'action',
      label: 'edit_approval_info',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem, index: number) => this.approval.emit({item: item, index: index}),
      show: () => this.approvalMode,
      disabled: () => this.readOnly
    },
  ];

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

  columns: string[] = ['identificationNumber', 'arabicName', 'collectorType', 'jobTitle', 'oldLicenseFullSerial', 'exportedLicenseFullSerial', 'actions'];
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
    this._requestType.next(val);
  }

  get requestType() {
    return this._requestType.value;
  }

  maxElementsCount?: number;
  @Input()
  formProperties: Record<string, () => Observable<any>> = {}

  constructor(private fb: UntypedFormBuilder,
              public lang: LangService,
              private dialog: DialogService,
              private lookupService: LookupService,
              private collectorApprovalService: CollectorApprovalService,
              private licenseService: LicenseService,
              private serviceDataService: ServiceDataService,
              private sharedService: SharedService) {
    super();
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
    this.listenToView();
    this.listenToRemove();
    this.listenToSave();
    // this.listenToDisableSearchField();
    this.listenToLicenseDurationTypeChanges();
    this.loadCustomSettings();
    this.listenToLicenseSearch();
  }

  loadCustomSettings() {
    this.serviceDataService.loadByCaseType(CaseTypes.COLLECTOR_LICENSING).subscribe((service) => {
      const customSettings = (new ServiceCustomSettings()).clone(JSON.parse(service.customSettings));
      this.maxElementsCount = +customSettings.maxElementsCount!;
    });
  }

  ngAfterViewInit() {
    if (this.model.getCaseStatus() !== CommonCaseStatus.FINAL_APPROVE) {
      this.columns.splice(this.columns.indexOf('exportedLicenseFullSerial'), 1);
    }
    this.attachmentHandlerEmitter.emit(this.attachmentHandlerDirective);
  }

  private buildForm(): void {
    this.form = this.fb.group((new CollectorItem().buildForm(true)));
    this.toggleLicenseEndDate();
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
      .pipe(tap(_ => {
          this.item = new CollectorItem().clone<CollectorItem>({
            licenseDurationType: this.model.licenseDurationType
          });
          this.viewOnly = false;
        }
      ))
      .subscribe(() => this.formOpenedStatus.emit(true));
  }

  private listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        // always add one here to the selected index to avoid the if condition while process save
        this.editIndex = (++info.index);
        this.item = info.item;
        this.viewOnly = false;
        this.updateForm(this.item);
      }))
      .subscribe(() => this.formOpenedStatus.emit(true));
  }

  private listenToView() {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        this.item = info.item;
        this.viewOnly = true;
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
    if (this.model.collectorItemList.length < this.maxElementsCount!) {
      this.model.collectorItemList = this.model.collectorItemList.concat([item]);
      this.eventHappened.emit(AppEvents.ADD);
    } else {
      this.dialog.error(this.lang.map.collectors_max_items_count.change({x: this.maxElementsCount}));
    }
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
    this.viewOnly = false;
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

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.form.get('oldLicenseFullSerial')) as UntypedFormControl;
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
      }));
  }

  private openSelectLicense(licenses: CollectorLicense[]) {
    const licensesByDurationType = licenses.filter(l => l.licenseDurationTypeInfo.lookupKey == this.licenseDurationType);
    return this.licenseService.openSelectLicenseDialog(licensesByDurationType, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: CollectorLicense, details: CollectorLicense }>;
  }

  searchForLicense() {
    this.licenseSearch$.next(this.oldLicenseFullSerialField.value);
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectorSearch<CollectorApproval>({
            fullSerial: serial,
            licenseDurationType: this.model.licenseDurationType
          });
      }))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
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
          this.dialog.info(this.lang.map.x_already_exists.change({x: this.lang.map.license}));
        }
        return !isAlreadyAdded;
      }))
      .subscribe((_info) => {
        this.updateForm(this.item = _info.details.convertToItem());
      });
  }

  isNewRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.NEW);
  }

  isCancelRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.CANCEL);
  }

  viewOldLicense(item: CollectionItem): void {
    if (this.isNewRequestType() || !item.oldLicenseFullSerial) {
      return;
    }
    let license = {
      documentTitle: item.oldLicenseFullSerial,
      id: item.oldLicenseId
    };

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  viewGeneratedLicense(item: CollectorItem): void {
    if (!item.exportedLicenseFullSerial) {
      return;
    }
    let license = {
      documentTitle: item.exportedLicenseFullSerial,
      id: item.exportedLicenseId
    };

    this.licenseService.showLicenseContent(license, this.model.getCaseType())
      .subscribe((file) => {
        this.sharedService.openViewContentDialog(file, license);
      });
  }

  isLicenseAlreadyAdded(selectedLicense: any): boolean {
    return this.model.collectorItemList.some(x => x.oldLicenseFullSerial === selectedLicense.fullSerial);
  }

  isEditLicenseEndDateDisabled(): boolean {
    return (this.isPermanent || !this.isNewRequestType() || this.readOnly || this.viewOnly);
  }

  isSearchAllowed(): boolean {
    // if readonly or no request type or request type = new, edit is not allowed
    // if new or draft record, edit is allowed
    // if collection item is new, edit is allowed
    let isAllowed = false;
    if (this.readOnly || this.viewOnly || !this.model.requestType || this.model.requestType === CollectionRequestType.NEW) {
      isAllowed = false;
    } else if (!this.model?.id || (!!this.model?.id && this.model.canCommit()) || !this.item!.itemId) {
      isAllowed=  true;
    }
    !isAllowed ? this.oldLicenseFullSerialField.disable() : this.oldLicenseFullSerialField.enable()
    /*this.oldLicenseFullSerialField.updateValueAndValidity();*/
    return isAllowed;
  }
}
