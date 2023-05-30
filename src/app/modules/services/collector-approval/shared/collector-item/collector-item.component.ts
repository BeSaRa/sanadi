import { CollectorApprovalPopupComponent } from './../../popups/collector-approval-popup/collector-approval-popup.component';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { DialogService } from '@services/dialog.service';
import { exhaustMap, filter, skip, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { CollectorApproval } from '@models/collector-approval';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from '@models/admin-result';
import { LicenseService } from '@services/license.service';
import { CollectionRequestType } from '@enums/service-request-types';
import { SharedService } from '@services/shared.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { HasAttachmentHandlerDirective } from '@app/shared/directives/has-attachment-handler.directive';
import { AttachmentHandlerDirective } from '@app/shared/directives/attachment-handler.directive';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CollectorItem } from '@app/models/collector-item';
import { ToastService } from '@app/services/toast.service';
import { ComponentType } from '@angular/cdk/portal';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';

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

  @Input() readonly: boolean = false;

  /**
   * @description Reloads the list after updating the original list according to operation passed.
   */
  reload$: BehaviorSubject<{ operation: OperationTypes, savedRecord?: CollectorItem }> =
    new BehaviorSubject<{ operation: OperationTypes, savedRecord?: CollectorItem }>({ operation: OperationTypes.VIEW });
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<CollectorItem> = new Subject<CollectorItem>();
  view$: Subject<CollectorItem> = new Subject<CollectorItem>();
  confirmDelete$: Subject<CollectorItem> = new Subject<CollectorItem>();
  destroy$: Subject<any> = new Subject<any>();

  itemInOperationListIndex?: number;
  itemInOperationIndex?: number;
  itemInOperation?: CollectorItem;
  @Input()
  list: CollectorItem[] = [];

  form!: UntypedFormGroup;
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  actions: IMenuItem<CollectorItem>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CollectorItem) => this.view$.next(item),
      show: () => !this.approvalMode && this.readonly
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem) => this.edit$.next(item),
      show: () => !this.approvalMode,
      disabled: () => this.readonly
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE_TRASH,
      onClick: (item: CollectorItem) => this.confirmDelete$.next(item),
      show: () => !this.approvalMode,
      disabled: () => this.readonly
    },
    // edit approval info (if approval mode)
    {
      type: 'action',
      label: 'edit_approval_info',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CollectorItem, index: number) => this.approval.emit({ item: item, index: index }),
      show: () => this.approvalMode,
      disabled: () => this.readonly
    },
  ];

  @Output()
  approval: EventEmitter<{ item: CollectorItem, index: number }> = new EventEmitter<{ item: CollectorItem; index: number }>();

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

  @Input()
  formProperties: Record<string, () => Observable<any>> = {}

  constructor(private fb: UntypedFormBuilder,
    public lang: LangService,
    public toast: ToastService,
    private dialog: DialogService,
    private lookupService: LookupService,
    private licenseService: LicenseService,
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

  private resetForm(): void {
    this.form.reset();
  }

  _getDialogComponent(): ComponentType<any> {
    return CollectorApprovalPopupComponent;
  }
  private _itemInOperationIndex(): number {
    return !this.itemInOperation ? -1 : this.list.findIndex(x => x === this.itemInOperation);
  }

  private _updateList(operation: OperationTypes, addedOrUpdatedRecord?: CollectorItem) {
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
        return this.dialog.show<IDialogData<CollectorItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(),
          operation: OperationTypes.CREATE,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: undefined,
          extras: {
            collectorModel: this.model,
            licenseDurationType: this.model?.licenseDurationType
          }
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: CollectorItem) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: CollectorItem) => {
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
        return this.dialog.show<IDialogData<CollectorItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.UPDATE,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: {
            collectorModel: this.model,
            licenseDurationType: this.model?.licenseDurationType
          }
        }).onAfterClose$;
      }))
      .pipe(switchMap((savedRecord: CollectorItem) => {
        return this.onClosePopup(savedRecord);
      }))
      .subscribe((savedRecord: CollectorItem) => {
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
        return this.dialog.show<IDialogData<CollectorItem>>(this._getDialogComponent(), {
          model: this._getNewInstance(model),
          operation: OperationTypes.VIEW,
          list: this.list,
          caseType: this.model.caseType,
          listIndex: this._itemInOperationIndex(),
          extras: {
            collectorModel: this.model,
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

  _getNewInstance(override?: Partial<CollectorItem> | undefined): CollectorItem {
    return new CollectorItem().clone(override ?? {});
  }

  forceClearComponent() {
    this.list = [];
    this.reload$.next({operation: OperationTypes.VIEW});
  }
  onClosePopup(savedRecord: CollectorItem): Observable<CollectorItem> {
    return of(savedRecord)
  }
  cancel(): void {
    this.itemInOperation = undefined;
    this.itemInOperationIndex = undefined;
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  isNewRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.NEW);
  }

  viewOldLicense(item: CollectorItem): void {
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
