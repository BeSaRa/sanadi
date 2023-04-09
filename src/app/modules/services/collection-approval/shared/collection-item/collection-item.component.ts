import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CollectionApproval } from '@models/collection-approval';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CollectionItem } from '@models/collection-item';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { AppEvents } from '@enums/app-events';
import { DialogService } from '@services/dialog.service';
import { UserClickOn } from '@enums/user-click-on.enum';
import { LicenseService } from '@services/license.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { CollectionRequestType } from '@enums/service-request-types';
import { BuildingPlateComponent } from '@app/shared/components/building-plate/building-plate.component';
import { SharedService } from '@services/shared.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { LicenseDurationType } from '@enums/license-duration-type';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { AttachmentHandlerDirective } from '@app/shared/directives/attachment-handler.directive';
import { HasAttachmentHandlerDirective } from '@app/shared/directives/has-attachment-handler.directive';
import { CollectionItemPopupComponent } from './collection-item-popup/collection-item-popup.component';

@Component({
  selector: 'collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss']
})
export class CollectionItemComponent extends HasAttachmentHandlerDirective implements OnInit, AfterViewInit, OnDestroy {

  constructor(private fb: UntypedFormBuilder,
    public lang: LangService,
    private licenseService: LicenseService,
    private sharedService: SharedService,
    private dialog: DialogService) {
    super();
  }

  @ViewChild(AttachmentHandlerDirective) attachmentHandlerDirective?: AttachmentHandlerDirective;

  @Output()
  attachmentHandlerEmitter: EventEmitter<AttachmentHandlerDirective> = new EventEmitter<AttachmentHandlerDirective>();

  @Input()
  model!: CollectionApproval;

  @Input()
  formProperties: Record<string, () => Observable<any>> = {}
  destroy$: Subject<any> = new Subject<any>();
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem, index: number }>();
  view$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem, index: number }>();
  remove$: Subject<{ item: CollectionItem, index: number }> = new Subject<{ item: CollectionItem; index: number }>();
  save$: Subject<null> = new Subject<null>();

  editIndex: number | undefined = undefined;

  item?: CollectionItem;

  form!: UntypedFormGroup;

  actions: IMenuItem<CollectionItem>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CollectionItem, index: number) => this.view$.next({ item: item, index: index }),
      show: (_item: CollectionItem) => !this.approvalMode && this.readOnly
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectionItem, index: number) => this.edit$.next({ item: item, index: index }),
      show: (_item: CollectionItem) => !this.approvalMode,
      disabled: (_item: CollectionItem) => this.readOnly
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE_TRASH,
      onClick: (item: CollectionItem, index: number) => this.remove$.next({ item: item, index: index }),
      show: (_item: CollectionItem) => !this.approvalMode,
      disabled: (_item: CollectionItem) => this.readOnly
    },
    // edit approval info (if approval mode)
    {
      type: 'action',
      label: 'edit_approval_info',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectionItem, index: number) => this.approval.emit({ item: item, index: index }),
      show: (_item: CollectionItem) => this.approvalMode,
      disabled: (_item: CollectionItem) => this.readOnly
    },
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  @Output()
  approval: EventEmitter<{ item: CollectionItem, index: number }> = new EventEmitter<{ item: CollectionItem; index: number }>();

  @Output()
  eventHappened: EventEmitter<AppEvents> = new EventEmitter<AppEvents>();
  @Output()
  formOpenedStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns: string[] = ['identificationNumber', 'zoneNumber', 'streetNumber', 'buildingNumber', 'unitNumber', 'licenseEndDate', 'map', 'oldLicenseFullSerial', 'exportedLicenseFullSerial', 'actions'];
  @Input()
  approvalMode: boolean = false;

  @Input()
  disableAdd: boolean = false;

  @Input() readOnly: boolean = false;

  private currentDurationType: BehaviorSubject<LicenseDurationType | undefined> = new BehaviorSubject<LicenseDurationType | undefined>(undefined);

  @Input()
  set licenseDurationType(value: LicenseDurationType | undefined) {
    this.currentDurationType.next(value);
  }

  get licenseDurationType(): LicenseDurationType | undefined {
    return this.currentDurationType.value;
  }


  private _disableSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  buildingPlate!: BuildingPlateComponent;

  @Input()
  set disableSearch(val: boolean) {
    this._disableSearch.next(val);
  }

  get disableSearch(): boolean {
    return this._disableSearch.value;
  }

  get oldLicenseFullSerial(): AbstractControl {
    return this.form.get('oldLicenseFullSerial')!;
  }

  ngOnInit(): void {
    if (!this.model) {
      throw Error('Please Provide Model to get the Collection Items from it');
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
    this.listenToDurationTypeChange();
  }

  ngAfterViewInit() {
    if (this.model.getCaseStatus() !== CommonCaseStatus.FINAL_APPROVE) {
      this.columns.splice(this.columns.indexOf('exportedLicenseFullSerial'), 1);
    }
    this.attachmentHandlerEmitter.emit(this.attachmentHandlerDirective);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  _getFormDialog() {
    return CollectionItemPopupComponent;
  }
  private listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => {
        this.item = new CollectionItem().clone<CollectionItem>({
          licenseDurationType: this.model.licenseDurationType,
          requestClassification: this.model.requestClassification
        });
        this.dialog.show(this._getFormDialog(), {
          viewOnly: false,
          oldLicenseFullSerial: this.oldLicenseFullSerial,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model
        }).onAfterClose$.subscribe((data) => {
          if (data) {
            this.buildingPlate = data.buildingPlate;
            this.save$.next();
          } else {
            this.cancel();
          }
        })
      }))
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
          oldLicenseFullSerial: this.oldLicenseFullSerial,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model
        }).onAfterClose$.subscribe((data) => {
          if (data) {
            this.buildingPlate = data.buildingPlate;
            this.save$.next()
          } else {
            this.cancel()
          }
        })
      }))
      .subscribe(() => this.formOpenedStatus.emit(true));
  }

  private listenToView() {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(info => {
        this.item = info.item;
        this.dialog.show(this._getFormDialog(), {
          viewOnly: true,
          oldLicenseFullSerial: this.oldLicenseFullSerial,
          form: this.form,
          readOnly: this.readOnly,
          editIndex: this.editIndex,
          item: this.item,
          model: this.model
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

  private buildForm(): void {
    this.form = this.fb.group((new CollectionItem().buildForm(true)));
    this.oldLicenseFullSerial.disable();
  }

  get licenseEndDate(): AbstractControl {
    return this.form.get('licenseEndDate')!;
  }

  private resetForm(): void {
    this.form.reset();
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
        }));
      });
  }

  private processSave(item: CollectionItem): void {
    this.editIndex ? this.processEdit(item) : this.processAdd(item);
    this.cancel();
  }

  private processAdd(item: CollectionItem): void {
    this.model.collectionItemList = this.model.collectionItemList.concat([item]);
    this.eventHappened.emit(AppEvents.ADD);
  }

  private processEdit(item: CollectionItem): void {
    this.model.collectionItemList.splice((this.editIndex!) - 1, 1, item);
    this.model.collectionItemList = [...this.model.collectionItemList];
    this.eventHappened.emit(AppEvents.EDIT);
  }

  private processDelete(index: number): void {
    this.model.collectionItemList.splice(index, 1);
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

  cancel(): void {
    this.item = undefined;
    this.editIndex = undefined;
    this.resetForm();
    this.formOpenedStatus.emit(false);
  }

  private validateForm(): Observable<boolean> {
    return of(this.form.valid && this.buildingPlate.isValidForm())
      .pipe(tap(valid => !valid && this.formInvalidMessage()))
      .pipe(filter((val) => val)) // allow only the valid form
      .pipe(map(_ => !(!this.item!.latitude || !this.item!.latitude))) // if no lat/lng return false
      .pipe(tap(validLatLong => !validLatLong && this.longitudeLatitudeInvalidMessage()))
      .pipe(filter((val) => val)) // allow only the valid form
      // .pipe(tap(_ => console.log(this.model.requestType, CollectionRequestType.NEW)))
      .pipe(map(_ => ((this.model.requestType !== CollectionRequestType.NEW) ? this.oldLicenseFullSerial.value : true)))
      .pipe(tap(validSelected => (!validSelected && this.selectedLicenseInvalidMessage())))
      .pipe(filter((val) => val)); // allow only the valid form
  }

  private longitudeLatitudeInvalidMessage() {
    this.dialog.error(this.lang.map.longitude_latitude_required);
  }

  private selectedLicenseInvalidMessage() {
    this.dialog.error(this.lang.map.edit_cancel_request_need_exists_license);
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

  viewGeneratedLicense(item: CollectionItem): void {
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


  private listenToDurationTypeChange(): void {
    this.currentDurationType
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: LicenseDurationType | undefined) => {
        this.licenseEndDate.setValidators(value === LicenseDurationType.TEMPORARY ? [CustomValidators.required] : null);
      });
  }
}
