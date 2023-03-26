import {of, Subject} from 'rxjs';
import {Component, Input, ViewChild} from '@angular/core';
import {AidLookup} from '@app/models/aid-lookup';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {AidLookupService} from '@app/services/aid-lookup.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AidTypes} from '@app/enums/aid-types.enum';
import {IAidLookupCriteria} from '@app/interfaces/i-aid-lookup-criteria';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ConfigurationService} from '@app/services/configuration.service';
import {SharedService} from '@app/services/shared.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {AidLookupStatusEnum} from '@app/enums/status.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SearchColumnConfigMap} from '@contracts/i-search-column-config';
import {CustomValidators} from '@app/validators/custom-validators';
import {LookupService} from '@services/lookup.service';
import {FormBuilder} from '@angular/forms';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'app-aid-lookup',
  templateUrl: './aid-lookup.component.html',
  styleUrls: ['./aid-lookup.component.scss']
})
export class AidLookupComponent extends AdminGenericComponent<AidLookup, AidLookupService> {
  @Input() aidType!: number;
  @Input() parentId!: number;

  displayedColumns: string[] = ['aidCode', 'arName', 'enName', 'status', 'statusDateModified', 'actions'];
  aidLookupStatusEnum = AidLookupStatusEnum;
  view$: Subject<AidLookup> = new Subject<AidLookup>();
  @ViewChild('table') table!: TableComponent;

  constructor(public langService: LangService,
              public service: AidLookupService,
              private dialogService: DialogService,
              public configService: ConfigurationService,
              private sharedService: SharedService,
              private lookupService: LookupService,
              private fb: FormBuilder,
              public toast: ToastService) {
    super();
  }

  protected _init() {
    this.listenToView();
    this.buildFilterForm();
  }

  getTitleText(): (keyof ILanguageKeys) {
    let title: keyof ILanguageKeys = 'menu_aid_class';
    switch (this.aidType) {
      case AidTypes.CLASSIFICATIONS:
        title = 'menu_aid_class';
        break;
      case AidTypes.MAIN_CATEGORY:
        title = 'menu_aid_main_category';
        break;
      case AidTypes.SUB_CATEGORY:
        title = 'menu_aid_sub_category';
        break;
    }
    return title;
  }

  get selectedRecords(): AidLookup[] {
    return this.table.selection.selected;
  }

  searchColumns: string[] = ['search_aidCode', 'search_arName', 'search_enName', 'search_status', 'search_statusDateModified', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_aidCode: {
      key: 'aidCode',
      controlType: 'text',
      property: 'aidCode',
      label: 'lbl_aid_code',
      maxLength: CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
    },
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'lbl_arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'lbl_english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.AidLookupStatus.filter(status => status.lookupKey !== AidLookupStatusEnum.RETIRED),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  sortingCallbacks = {
    statusDate: (a: AidLookup, b: AidLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusDateModifiedString.toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusDateModifiedString.toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: AidLookup, b: AidLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  actions: IMenuItem<AidLookup>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: AidLookup) => this.edit(item, undefined)
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: AidLookup) => this.remove(item)
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: AidLookup) => this.view$.next(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'logs',
      onClick: (item: AidLookup) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: AidLookup) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== AidLookupStatusEnum.RETIRED && item.status === AidLookupStatusEnum.INACTIVE;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: AidLookup) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== AidLookupStatusEnum.RETIRED && item.status === AidLookupStatusEnum.ACTIVE;
      }
    }
  ]

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      aidCode: [''], arName: [''], enName: [''], status: [null]
    })
  }

  getColumnFilterValue(): Partial<AidLookup> {
    const value: Partial<AidLookup> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.parent = this.parentId ?? null;
      value.aidType = this.aidType;
      return value;
    }
    return {};
  }

  listenToReload(): void {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(
        filter(() => {
          if (this.columnFilterFormHasValue()) {
            this.columnFilter$.next('filter');
            return false;
          }
          return true;
        })
      )
      .pipe(switchMap(() => {
        const criteria: IAidLookupCriteria = {aidType: this.aidType, parent: this.parentId};
        const load = this.service.loadByCriteria(criteria);
        return load.pipe(
          catchError(_ => of([]))
        );
      }))
      .subscribe((list: AidLookup[]) => {
        this.models = list;
        this.table && this.table.clearSelection();
      })
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id, this.aidType).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.aidType, this.parentId).onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => this.service.openUpdateDialog(model.id, this.aidType).pipe(catchError(_ => of(null)))))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  edit(aidLookup: AidLookup, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.edit$.next(aidLookup);
  }

  remove(aidLookup: AidLookup, $event?: MouseEvent): void {
    $event?.preventDefault();
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: aidLookup.aidCode}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          aidLookup.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: aidLookup.aidCode}));
            this.reload$.next(null);
          });
        }
      });
  }

  deactivateBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deactivateBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  showAuditLogs(aidLookup: AidLookup, $event?: MouseEvent): void {
    $event?.preventDefault();
    aidLookup.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  toggleStatus(aidLookup: AidLookup) {
    this.service.updateStatus(aidLookup.id, aidLookup.status!)
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: aidLookup.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: aidLookup.getName()}));
        this.reload$.next(null);
      });
  }
}
