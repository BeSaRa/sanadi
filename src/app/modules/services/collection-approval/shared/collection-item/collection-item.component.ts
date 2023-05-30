import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CollectionApproval } from '@models/collection-approval';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { exhaustMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CollectionItem } from '@models/collection-item';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { DialogService } from '@services/dialog.service';
import { UserClickOn } from '@enums/user-click-on.enum';
import { LicenseService } from '@services/license.service';
import { CollectionRequestType } from '@enums/service-request-types';
import { BuildingPlateComponent } from '@app/shared/components/building-plate/building-plate.component';
import { SharedService } from '@services/shared.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { AttachmentHandlerDirective } from '@app/shared/directives/attachment-handler.directive';
import { HasAttachmentHandlerDirective } from '@app/shared/directives/has-attachment-handler.directive';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ToastService } from '@app/services/toast.service';
import { ComponentType } from '@angular/cdk/portal';
import { CollectionItemPopupComponent } from '../../popups/collection-item-popup/collection-item-popup.component';

@Component({
  selector: 'collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.scss']
})
export class CollectionItemComponent extends HasAttachmentHandlerDirective implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    public lang: LangService,
    public toast: ToastService,
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
  list: CollectionItem[] = [];
  @Input()
  formProperties: Record<string, () => Observable<any>> = {};

  /**
     * @description Reloads the list after updating the original list according to operation passed.
     */
  reload$: BehaviorSubject<{ operation: OperationTypes, savedRecord?: CollectionItem }> =
    new BehaviorSubject<{ operation: OperationTypes, savedRecord?: CollectionItem }>({ operation: OperationTypes.VIEW });
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<CollectionItem> = new Subject<CollectionItem>();
  view$: Subject<CollectionItem> = new Subject<CollectionItem>();
  confirmDelete$: Subject<CollectionItem> = new Subject<CollectionItem>();
  destroy$: Subject<any> = new Subject<any>();

  itemInOperationListIndex?: number;
  itemInOperationIndex?: number;
  itemInOperation?: CollectionItem;

  form!: UntypedFormGroup;

  actions: IMenuItem<CollectionItem>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CollectionItem) => this.view$.next(item),
      show: (_item: CollectionItem) => !this.approvalMode && this.readonly
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectionItem) => this.edit$.next(item),
      show: (_item: CollectionItem) => !this.approvalMode,
      disabled: (_item: CollectionItem) => this.readonly
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE_TRASH,
      onClick: (item: CollectionItem) => this.confirmDelete$.next(item),
      show: (_item: CollectionItem) => !this.approvalMode,
      disabled: (_item: CollectionItem) => this.readonly
    },
    // edit approval info (if approval mode)
    {
      type: 'action',
      label: 'edit_approval_info',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectionItem, index: number) => this.approval.emit({ item: item, index: index }),
      show: (_item: CollectionItem) => this.approvalMode,
      disabled: (_item: CollectionItem) => this.readonly
    },
  ];

  filterControl: UntypedFormControl = new UntypedFormControl('');
  @Output()
  approval: EventEmitter<{ item: CollectionItem, index: number }> = new EventEmitter<{ item: CollectionItem; index: number }>();

  columns: string[] = ['identificationNumber', 'zoneNumber', 'streetNumber', 'buildingNumber', 'unitNumber', 'licenseEndDate', 'map', 'oldLicenseFullSerial', 'exportedLicenseFullSerial', 'actions'];
  @Input()
  approvalMode: boolean = false;

  @Input()
  disableAdd: boolean = false;

  @Input() readonly: boolean = false;

  private _disableSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  buildingPlate!: BuildingPlateComponent;

  @Input()
  set disableSearch(val: boolean) {
    this._disableSearch.next(val);
  }
  get disableSearch(): boolean {
    return this._disableSearch.value;
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
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
    this.listenToConfirmDelete();
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

  private resetForm(): void {
    this.form.reset();
  }

  openLocationMap(item: CollectionItem) {
    item.openMap(true);
  }

  private _itemInOperationIndex(): number {
    return !this.itemInOperation ? -1 : this.list.findIndex(x => x === this.itemInOperation);
  }
  cancel(): void {
    this.itemInOperation = undefined;
    this.itemInOperationIndex = undefined;
    this.resetForm();
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

  _getDialogComponent(): ComponentType<any> {
    return CollectionItemPopupComponent;
  }

  private _updateList(operation: OperationTypes, addedOrUpdatedRecord?: CollectionItem) {
    const itemInOperationIndex = this._itemInOperationIndex();
    if (operation === OperationTypes.DELETE) {
      itemInOperationIndex > -1 ? this.list.splice(itemInOperationIndex, 1) : null;
    } else {
      if (addedOrUpdatedRecord) {
        if (operation === OperationTypes.CREATE) {
          this.list.push(addedOrUpdatedRecord);
        } else if (operation === OperationTypes.UPDATE) {
          itemInOperationIndex > -1 ? this.list.splice(itemInOperationIndex, 1, addedOrUpdatedRecord) : null;
        }
      }
    }
    this.list = this.list.slice();
  }

  listenToReload(): void {
    this.reload$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this._updateList(result.operation, result.savedRecord);
        this.itemInOperation = undefined;
        this.itemInOperationListIndex = undefined;
      })
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(() => this.itemInOperation = undefined))
      .pipe(exhaustMap(() => {
        return this.dialog.show<IDialogData<CollectionItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(),
          operation: OperationTypes.CREATE,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: undefined,
          extras: {
            collectionModel: this.model,
            licenseDurationType: this.model?.licenseDurationType
          }
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: CollectionItem) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: CollectionItem) => {
        if (!savedRecord) {
          return;
        }
        this.reload$.next({ operation: OperationTypes.CREATE, savedRecord: savedRecord });
      })
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((model) => this.itemInOperation = model))
      .pipe(exhaustMap((model) => {
        return this.dialog.show<IDialogData<CollectionItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.UPDATE,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: {
            collectionModel: this.model,
            licenseDurationType: this.model?.licenseDurationType
          }
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: CollectionItem) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: CollectionItem) => {
        if (!savedRecord) {
          return;
        }
        this.reload$.next({ operation: OperationTypes.UPDATE, savedRecord: savedRecord });
      })
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((model) => this.itemInOperation = model))
      .pipe(exhaustMap((model) => {
        return this.dialog.show<IDialogData<CollectionItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.VIEW,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: {
            collectionModel: this.model,
            licenseDurationType: this.model?.licenseDurationType
          }
        }).onAfterClose$;
      }))
      .subscribe()
  }

  listenToConfirmDelete(): void {
    this.confirmDelete$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap((model) => {
        return this.dialog.confirm(this.lang.map.msg_confirm_delete_selected).onAfterClose$
          .pipe(tap((userSelection) => {
            this.itemInOperation = undefined;
            this.itemInOperationListIndex = undefined;
            if (userSelection === UserClickOn.YES) {
              this.itemInOperation = model;
              this.itemInOperationListIndex = this._itemInOperationIndex();
            }
          }));
      }))
      .subscribe((userSelection: UserClickOn) => {
        if (userSelection === UserClickOn.YES) {
          this.toast.success(this.lang.map.msg_deleted_in_list_success);
          this.reload$.next({ operation: OperationTypes.DELETE });
        }
      })
  }

  onClosePopup(savedRecord: CollectionItem): Observable<CollectionItem> {
    return of(savedRecord)
  }

  forceClearComponent() {
    this.list = [];
    this.reload$.next({operation: OperationTypes.VIEW});
  }

  _getNewInstance(override?: Partial<CollectionItem> | undefined): CollectionItem {
    return new CollectionItem().clone(override ?? {});
  }
}
