import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { DialogService } from '@services/dialog.service';
import { filter, map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@enums/user-click-on.enum';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { AppEvents } from '@enums/app-events';
import { CollectorApproval } from '@models/collector-approval';
import { CollectorItem } from '@models/collector-item';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { IKeyValue } from '@contracts/i-key-value';
import { DateUtils } from '@helpers/date-utils';
import { LicenseDurationType } from '@enums/license-duration-type';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from '@models/admin-result';
import { LicenseService } from '@services/license.service';
import { CollectionRequestType } from '@enums/service-request-types';
import { ServiceDataService } from '@services/service-data.service';
import { CaseTypes } from '@enums/case-types.enum';
import { ServiceCustomSettings } from '@models/service-custom-settings';
import { SharedService } from '@services/shared.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { CollectionItem } from '@models/collection-item';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { HasAttachmentHandlerDirective } from '@app/shared/directives/has-attachment-handler.directive';
import { AttachmentHandlerDirective } from '@app/shared/directives/attachment-handler.directive';
import { CollectorApprovalPopupComponent } from './collector-approval-popup/collector-approval-popup.component';

@Component({
  selector: 'collector-item',
  templateUrl: './collector-item.component.html',
  styleUrls: ['./collector-item.component.scss']
})
export class CollectorItemComponent extends HasAttachmentHandlerDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(AttachmentHandlerDirective) attachmentHandlerDirective?: AttachmentHandlerDirective;
  @Output() attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective> = new EventEmitter<AttachmentHandlerDirective>();

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
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  isPermanent!: boolean;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  actions: IMenuItem<CollectorItem>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CollectorItem, index: number) => this.view$.next({ item: item, index: index }),
      show: () => !this.approvalMode && this.readOnly
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem, index: number) => this.edit$.next({ item: item, index: index }),
      show: () => !this.approvalMode,
      disabled: () => this.readOnly
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE_TRASH,
      onClick: (item: CollectorItem, index: number) => this.remove$.next({ item: item, index: index }),
      show: () => !this.approvalMode,
      disabled: () => this.readOnly
    },
    // edit approval info (if approval mode)
    {
      type: 'action',
      label: 'edit_approval_info',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem, index: number) => this.approval.emit({ item: item, index: index }),
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
    this.listenToLicenseDurationTypeChanges();
    this.loadCustomSettings();
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
        this.dialog.show(this._getFormDialog(), {
          viewOnly: false,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model,
          licenseDurationType: this.licenseDurationType,
          isPermanent: this.isPermanent
        }).onAfterClose$.subscribe((data) => {
          if (data) {
            this.save$.next();
          } else {
            this.cancel();
          }
        })
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
        this.dialog.show(this._getFormDialog(), {
          viewOnly: false,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model,
          licenseDurationType: this.licenseDurationType,
          isPermanent: this.isPermanent
        }).onAfterClose$.subscribe((data) => {
          if (data) {
            this.save$.next();
          } else {
            this.cancel();
          }
        })
      }))
      .subscribe(() => this.formOpenedStatus.emit(true));
  }

  _getFormDialog() {
    return CollectorApprovalPopupComponent;
  }
  private listenToView() {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        this.item = info.item; this.dialog.show(this._getFormDialog(), {
          viewOnly: true,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model,
          licenseDurationType: this.licenseDurationType,
          isPermanent: this.isPermanent
        }).onAfterClose$.subscribe(() => {
          this.cancel()
        })
      }))
      .subscribe(() => this.formOpenedStatus.emit(true));
  }

  private listenToRemove() {
    this.remove$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(info => {
        return this.dialog
          .confirm(this.lang.map.msg_confirm_delete_x.change({ x: info.item.identificationNumber }))
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
      this.dialog.error(this.lang.map.collectors_max_items_count.change({ x: this.maxElementsCount }));
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

  isNewRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.NEW);
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

}
