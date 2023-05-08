import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {Country} from '@app/models/country';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {TableComponent} from '@app/shared/components/table/table.component';
import {LangService} from '@app/services/lang.service';
import {CountryService} from '@app/services/country.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ITableOptions} from '@app/interfaces/i-table-options';
import {SortEvent} from '@app/interfaces/sort-event';
import {isEmptyObject} from '@app/helpers/utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {SharedService} from '@app/services/shared.service';
import {LookupService} from '@app/services/lookup.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {FilterEventTypes} from '@app/types/types';
import {AdminGenericComponent} from "@app/generics/admin-generic-component";
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchColumnConfigMap} from '@app/interfaces/i-search-column-config';
import {FormBuilder} from '@angular/forms';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent extends AdminGenericComponent<Country, CountryService> implements AfterViewInit {
  usePagination = true
  actions: IMenuItem<Country>[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'riskLevel', 'status', 'statusDateModified', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_riskLevel', 'search_status', 'search_statusDateModified', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_riskLevel: {
      key: 'riskLevel',
      controlType: 'text',
      property: 'riskLevel',
      label: 'risk_level',
      mask: CustomValidators.inputMaskPatterns.NUMBER_ONLY
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }
  @Input() headerTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  bulkActions: IGridAction[] = [];
  view$: Subject<Country> = new Subject<Country>();

  @ViewChild('table') table!: TableComponent;

  constructor(public langService: LangService,
    public service: CountryService,
    private toast: ToastService,
    private dialogService: DialogService,
    private lookupService: LookupService,
    private sharedService: SharedService,
    private fb: FormBuilder) {
    super()
  }

  tableOptions: ITableOptions = {
    ready: false,
    columns: this.displayedColumns,
    searchText: '',
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    },
    searchCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    filterCallback: (_type: FilterEventTypes = 'OPEN') => {
    },
    sortingCallbacks: {
      statusDateModified: (a: Country, b: Country, dir: SortEvent): number => {
        // @ts-ignore
        let value1 = !CommonUtils.isValidValue(a) ? '' : new Date(a.statusDateModified).valueOf(),
          // @ts-ignore
          value2 = !CommonUtils.isValidValue(b) ? '' : new Date(b.statusDateModified).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      statusInfo: (a: Country, b: Country, dir: SortEvent): number => {
        let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  protected _init(): void {
    this.buildActions();
    this.buildBulkActions();
    this.listenToView();
    this.buildFilterForm();
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.tableOptions.ready = true;
    });
  }

  getTitleText(): (keyof ILanguageKeys) {
    return isEmptyObject(this.headerTitle) ? 'menu_countries' : this.headerTitle;
  }

  add(): void {
    const sub = this.service.openCreateDialog().subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  editCountry(country: Country, tab: 'basic' = 'basic'): void {
    const sub = this.service.openUpdateDialog(country.id, tab).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  deleteCountry(model: Country): void {
    // @ts-ignore
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({ x: model.getName() })).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.langService.map.msg_delete_x_success.change({ x: model.getName() }));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.table.selection.selected.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
          if (click === UserClickOn.YES) {
            const ids = this.table.selection.selected.map((item) => {
              return item.id;
            });
            const sub = this.service.deleteBulk(ids).subscribe((response) => {
              this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response)
                .subscribe(() => {
                  this.reload$.next(null);
                  sub.unsubscribe();
                });
            });
          }
        });
    }
  }

  activateCountry(model: Country): void {
    const sub = model.updateStatus(CommonStatusEnum.ACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_update_x_success.change({ x: model.getName() }));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  deactivateCountry(model: Country): void {
    const sub = model.updateStatus(CommonStatusEnum.DEACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_update_x_success.change({ x: model.getName() }));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.service.updateStatusBulk(this.table.selection.selected.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: Country) {
    model.status == CommonStatusEnum.ACTIVATED ? model.status = CommonStatusEnum.DEACTIVATED : model.status = CommonStatusEnum.ACTIVATED;
    model.update()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }

  private buildActions() {
    // noinspection JSUnusedLocalSymbols
    this.actions = [
      // edit
      {
        type: 'action',
        icon: ActionIconsEnum.EDIT,
        label: 'btn_edit',
        onClick: (item: Country) => this.editCountry(item),
      },
      // delete
      /*{
       type: 'action',
       icon: ActionIconsEnum.DELETE,
       label: 'btn_delete',
       onClick: (item: Country) => this.deleteCountry(item),
       show: (item) => {
       return true
       }
       },*/
      // view
      {
        type: 'action',
        icon: ActionIconsEnum.VIEW,
        label: 'view',
        onClick: (item: Country) => this.view$.next(item),
      },
      // logs
      {
        type: 'action',
        icon: ActionIconsEnum.HISTORY,
        label: 'show_logs',
        onClick: (item: Country) => this.showAuditLogs(item)
      },
      // activate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_activate',
        onClick: (item: Country) => this.activateCountry(item),
        show: (item) => {
          return item.status === CommonStatusEnum.DEACTIVATED;
        },
        displayInGrid: false
      },
      // deactivate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_deactivate',
        onClick: (item: Country) => this.deactivateCountry(item),
        show: (item) => {
          return item.status === CommonStatusEnum.ACTIVATED;
        },
        displayInGrid: false
      }
    ];
  }

  private buildBulkActions() {
    // noinspection JSUnusedLocalSymbols
    this.bulkActions = [
      /*{
       icon: 'mdi-close-box',
       langKey: 'btn_delete',
       callback: ($event: MouseEvent, action: IGridAction) => this.deleteBulk($event),
       show: (items: Country[]) => {
       return true;
       }
       },*/
      {
        icon: 'mdi-list-status',
        langKey: 'lbl_status',
        children: [
          {
            langKey: 'btn_activate',
            icon: '',
            callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
            show: (items: Country[]) => {
              return true;
            }
          },
          {
            langKey: 'btn_deactivate',
            icon: '',
            callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
            show: (items: Country[]) => {
              return true;
            }
          }
        ],
      }
    ];
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], riskLevel: [''], status: [null]
    })
  }
}
