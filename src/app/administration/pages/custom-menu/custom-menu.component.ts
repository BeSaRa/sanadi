import { MenuItemService } from '@app/services/menu-item.service';
import {MenuItem} from '@app/models/menu-item';
import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {CommonUtils} from '@app/helpers/common-utils';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {SortEvent} from '@app/interfaces/sort-event';
import {CustomMenu} from '@app/models/custom-menu';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {CustomMenuService} from '@services/custom-menu.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {Observable, of, Subject} from 'rxjs';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ICustomMenuSearchCriteria} from '@contracts/i-custom-menu-search-criteria';
import {Pagination} from '@app/models/pagination';
import {SearchColumnConfigMap} from '@app/interfaces/i-search-column-config';
import {LookupService} from '@app/services/lookup.service';
import {FormBuilder} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {IKeyValue} from "@contracts/i-key-value";

@Component({
  selector: 'app-custom-menu',
  templateUrl: './custom-menu.component.html',
  styleUrls: ['./custom-menu.component.scss'],
})
export class CustomMenuComponent extends AdminGenericComponent<CustomMenu, CustomMenuService>
  implements AfterViewInit {
  usePagination = true;
  useCompositeToLoad = false;

  constructor(public lang: LangService,
              public service: CustomMenuService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              public toast: ToastService,
              private lookupService: LookupService,
              private menuItemService: MenuItemService,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this._setSearchColumns();
    this.buildFilterForm();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  @Input() parent?: CustomMenu;
  @Input() readonly: boolean = false;
  @Output() listUpdated: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('table') table!: TableComponent;
  selectedPopupTabName: string = 'basic';
  private _displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'menuType', 'status', 'actions'];

  isParentDefaultItem(): boolean {
    return !!this.parent && this.parent.isDefaultItem();
  }

  get displayedColumns(): string[] {
    if (this.isParentDefaultItem()) {
      return ['rowSelection', 'arName', 'enName', 'menuType', 'systemParent', 'status', 'actions']
    }
    return this._displayedColumns;
  }

  private _setSearchColumns(): void {
    if (this.isParentDefaultItem()) {
      this.searchColumns = ['_', 'search_arName', 'search_enName', 'search_menuType', 'search_systemParent', 'search_status', 'search_actions'];
      return;
    }
    this.searchColumns = ['_', 'search_arName', 'search_enName', 'search_menuType', 'search_status', 'search_actions'];
  }

  defaultParentsColumns: string[] = ['arName', 'enName', 'actions'];
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
    search_menuType: {
      key: 'menuType',
      controlType: 'select',
      property: 'menuType',
      label: 'menu_type',
      selectOptions: {
        options: this.lookupService.listByCategory.MenuType,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
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
    },
    search_systemParent: {
      key: 'systemMenuKey',
      controlType: 'select',
      property: 'systemMenuKey',
      label: 'parent',
      selectOptions: {
        options: this.menuItemService.parents
          .filter((x) => !x.customMenu && !x.excludeFromDefaultParents)
          .sort((a, b) => a.defaultId! - b.defaultId!),
        labelProperty: 'getName',
        optionValueKey: 'menuKey'
      }
    }
  }

  view$: Subject<CustomMenu> = new Subject<CustomMenu>();

  actions: IMenuItem<CustomMenu>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CustomMenu) => this.edit(item),
      show: (item: CustomMenu) => !this.readonly && !item.isDefaultItem()
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item) => this.delete(item),
      show: (item: CustomMenu) => !this.readonly && !item.isDefaultItem()
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: CustomMenu) => this.view(item),
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      show:(item)=> !item.isDefaultItem(),
      onClick: (item: CustomMenu) => this.showAuditLogs(item)
    },
    // children
    {
      type: 'action',
      label: 'sub_lists',
      icon: ActionIconsEnum.CHILD_ITEMS,
      onClick: (item) => this.showChildren(item),
      show: () => !this.parent,
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: CustomMenu) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item: CustomMenu) => {
        if (item.isDefaultItem()) {
          return false;
        }
        if (this.parent && !this.parent.isActive()) {
          return false;
        }
        if (this.readonly || item.status === CommonStatusEnum.RETIRED) {
          return false;
        }
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: CustomMenu) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item: CustomMenu) => {
        if (item.isDefaultItem()) {
          return false;
        }
        if (this.parent && !this.parent.isActive()) {
          return false;
        }
        if (this.readonly || item.status === CommonStatusEnum.RETIRED) {
          return false;
        }
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];

  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      },
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) =>
            this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: CustomMenu[]) => {
            return !(this.parent && !this.parent.isActive());

          },
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) =>
            this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: CustomMenu[]) => {
            return !(this.parent && !this.parent.isActive());

          },
        },
      ],
    },
  ];

  sortingCallbacks = {
    menuType: (a: CustomMenu, b: CustomMenu, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.menuTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.menuTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusInfo: (a: CustomMenu, b: CustomMenu, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    systemParent: (a: CustomMenu, b: CustomMenu, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getSystemParent()?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getSystemParent()?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

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
        let load: Observable<Pagination<CustomMenu[]>>;
        const paginationOptions = {
          limit: this.pageEvent.pageSize,
          offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
        };
        if (!!this.parent) {
          let criteria: Partial<ICustomMenuSearchCriteria> = {
            'parent-menu-item-id': this.parent.id
          };
          load = this.service.loadByCriteriaPaging(criteria, paginationOptions);
        } else {
          load = this.service.loadMain(paginationOptions);
        }
        return load.pipe(map((res) => {
            this.count = res.count;
            return res.rs;
          }),
          catchError(_ => {
            this.count = 0;
            return of([]);
          }));
      }))
      .subscribe((list: CustomMenu[]) => {
        this.models = list;
        this.afterReload();
      });
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
    this.listUpdated.emit(true);
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.parent).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openEditDialog(model.id, this.parent, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id, this.parent, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  edit(model: CustomMenu): void {
    this.selectedPopupTabName = 'basic';
    this.edit$.next(model);
  }

  view(model: CustomMenu): void {
    this.selectedPopupTabName = 'basic';
    this.view$.next(model);
  }

  showChildren(item: CustomMenu): void {
    this.selectedPopupTabName = 'sub';
    if (this.readonly) {
      this.view$.next(item);
    } else {
      this.edit$.next(item);
    }
  }

  showDefaultsChildren(item: MenuItem) {
    return this.service.openDefaultChildrenViewDialog(item)
      .pipe(catchError(_ => of(null)))

      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  delete(model: CustomMenu): void {
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
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

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.service.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  toggleStatus(model: CustomMenu) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        // this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }


  get selectedRecords(): CustomMenu[] {
    return this.table.selection.selected;
  }

  buildFilterForm() {
    const controls: IKeyValue = {
      arName: [''], enName: [''], menuType: [null], status: [null]
    };
    if (this.isParentDefaultItem()) {
      controls.systemMenuKey = [null];
    }
    this.columnFilterForm = this.fb.group(controls);
  }

  getColumnFilterValue(): Partial<CustomMenu> {
    const value: Partial<CustomMenu> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.parentMenuItemId = !!this.parent ? this.parent.id : undefined;
      return value;
    }
    return {};
  }

  allSelected() {
    return this.table.selection.selected.length === this.table.dataSource.data.filter(d => !d.isDefaultItem()).length;
  }

  toggleAllExceptSystem(): void {
    const allSelected = this.allSelected();
    if (allSelected) {
      this.table.clearSelection();
    } else {
      this.table.dataSource.data.forEach((item: CustomMenu) => !item.isDefaultItem() && this.table.selection.select(item));
    }
  }
}
