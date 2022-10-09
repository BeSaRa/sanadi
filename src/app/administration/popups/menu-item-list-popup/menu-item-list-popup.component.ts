import { HttpClient } from '@angular/common/http';
import { DialogService } from './../../../services/dialog.service';
import { MenuItemList } from './../../../models/menu-item-list';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Lookup } from '@app/models/lookup';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { FormManager } from '@app/models/form-manager';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { takeUntil, exhaustMap, filter, map, tap, catchError } from 'rxjs/operators';
import { MenuItemListService } from '@app/services/menu-item-list.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { SharedService } from '@app/services/shared.service';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { TabComponent } from '@app/shared/components/tab/tab.component';

@Component({
  selector: 'app-menu-item-list-popup',
  templateUrl: './menu-item-list-popup.component.html',
  styleUrls: ['./menu-item-list-popup.component.css'],
})
export class MenuItemListPopupComponent extends AdminGenericDialog<MenuItemList> {
  form!: UntypedFormGroup;
  fm!: FormManager;
  model!: MenuItemList;
  operation: OperationTypes;
  saveVisible = true;
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  menuTypes: Lookup[] = this.lookupService.listByCategory.MenuType;
  menuView: Lookup[] = this.lookupService.listByCategory.MenuView;
  userTypes: Lookup[] = this.lookupService.listByCategory.PermissionCategory;
  usePagination: any;
  pageEvent: any;
  count: any;
  subList: MenuItemList[]=[];
  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'main';

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }
  filterControl: UntypedFormControl = new UntypedFormControl('');
  displayedColumns: string[] = [
    'rowSelection',
    'arName',
    'enName',
    'status',
    'actions',
  ];;
  constructor(
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<MenuItemList>,
    private toast: ToastService,
    private lookupService: LookupService,
    private menuListItemService:MenuItemListService,
    private cd: ChangeDetectorRef,
    private dialogService:DialogService,
    private sharedService: SharedService,
    private http:HttpClient
  ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.defaultSelectedTab = data.selectedTab?? 'main';

    console.log(this.defaultSelectedTab);

  }

  initPopup(): void {
    this.listenToAddSubList();
    this.listenToReloadSubList();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.main.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.main.name);
  }
  beforeSave(model: MenuItemList, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: MenuItemList, form: UntypedFormGroup): Observable<MenuItemList> | MenuItemList {
    return (new MenuItemList()).clone({ ...model, ...form.value });
  }

  afterSave(model: MenuItemList, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
  }
  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_menu_item;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_menu_item;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  tabsData: IKeyValue = {
    main: { name: 'main' },
    linkSettings: { name: 'linkSettings' },
    sub: { name: 'sub' }
  };
  @ViewChild('table') table!: TableComponent;

  addSubList$: Subject<any> = new Subject<any>();
  reloadSubList$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actions: IMenuItem<MenuItemList>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      show: () => !this.readonly,
      onClick: (item) => this.view(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => !this.readonly,
      onClick: (item) => this.delete(item)
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly,
      onClick: (item) => this.edit(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: MenuItemList) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      displayInGrid: false,
      onClick: (item: MenuItemList) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  view(item: MenuItemList): void {
    const sub = this.menuListItemService.openSubListViewDialog(item).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reloadSubList$.next(null);
        sub.unsubscribe();
      });
    });
  }
  edit(item: MenuItemList): void {
    const sub = this.menuListItemService.openSubListEditDialog(item).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reloadSubList$.next(null);
        sub.unsubscribe();
      });
    });
  }

  toggleStatus(model: MenuItemList) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reloadSubList$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reloadSubList$.next(null);
      });
  }

  delete(model: MenuItemList): void {
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
            this.reloadSubList$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  listenToAddSubList() {
    this.addSubList$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.menuListItemService.openCreateDialog(this.model.id).onAfterClose$))
      .subscribe(() => this.reloadSubList$.next(null));
  }

  listenToReloadSubList() {
    this.reloadSubList$
      .pipe(
        takeUntil(this.destroy$),

      )
      .subscribe(() => {
        if(this.model.id){
          let load: Observable<MenuItemList[]>;
        load = this.menuListItemService.loadByParentIdPaging( this.model.id)


        load.pipe(takeUntil(this.destroy$),)
          .subscribe(result => {
            this.subList = result;
            this.table && this.table.clearSelection();
          });
        }

      });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
    this._setDefaultSelectedTab()
  }
  private _setDefaultSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.defaultSelectedTab) && this.tabsData[this.defaultSelectedTab]) {
        const index =this.defaultSelectedTab === 'main' ? 0 :2;
        this.selectedTabIndex$.next(index);
      }
    });
  }
  get selectedRecords(): MenuItemList[] {
    return this.table.selection.selected;
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
          const sub = this.menuListItemService.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.reloadSubList$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.menuListItemService.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reloadSubList$.next(null);
            sub.unsubscribe();
          });
      });
  }
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
          show: (_items: MenuItemList[]) => {
            return true;
          },
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) =>
            this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: MenuItemList[]) => {
            return true;
          },
        },
      ],
    },
  ];
  get menuURLControl():UntypedFormControl{
    return this.form.controls.menuURL as UntypedFormControl
  }
  isValidURL :boolean =false
  checkURL(){
   const sub= this.http.get<any>(this.menuURLControl.value).pipe(
      tap(()=>this.isValidURL = true),
      catchError(_=>{
        this.isValidURL = false
        this.dialogService.error(this.lang.map.err_invalid_URL)
        return of();
      })

    ).subscribe(()=>   sub.unsubscribe());


  }
}
