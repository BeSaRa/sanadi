import { AfterViewInit, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@contracts/i-dialog-data';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { LangService } from '@services/lang.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LookupService } from '@services/lookup.service';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from '@services/dialog.service';
import { DacOchaService } from '@services/dac-ocha.service';
import { Lookup } from '@app/models/lookup';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { FormManager } from '@app/models/form-manager';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { exhaustMap, filter, map, takeUntil } from 'rxjs/operators';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { TabMap } from '@app/types/types';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SortEvent } from '@contracts/sort-event';
import { CommonUtils } from '@helpers/common-utils';
import { DateUtils } from '@helpers/date-utils';
import { PageEvent } from '@contracts/page-event';
import { TableComponent } from '@app/shared/components/table/table.component';

@Component({
  selector: 'dac-ocha-new-popup',
  templateUrl: './dac-ocha-new-popup.component.html',
  styleUrls: ['./dac-ocha-new-popup.component.scss']
})
export class DacOchaNewPopupComponent extends AdminGenericDialog<AdminLookup> implements AfterViewInit {
  usePagination: boolean = true;
  count: number = 0;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AdminLookup>,
    public lang: LangService,
    public fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    public lookupService: LookupService,
    public toast: ToastService,
    public dialogRef: DialogRef,
    public dialogService: DialogService,
    public dacOchaService: DacOchaService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.defaultSelectedTab = data.selectedTab || 'basic';
    this.classification = this.lookupService.findLookupByLookupKey(this.lookupService.listByCategory.AdminLookupType, this.model.type) ?? new Lookup();
    this.adminLookupTypeId = data.model.type;
  }

  actionIconsEnum = ActionIconsEnum;
  classification: Lookup;
  form!: UntypedFormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: AdminLookup;
  validateFieldsVisible = true;
  saveVisible = true;
  tabsData: TabMap = {
    basic: { name: 'basic', langKey: 'lbl_basic_info', index: 0, validStatus: () => true, isTouchedOrDirty: () => true },
    children: {
      name: 'children',
      langKey: 'sub_dac_ochas',
      index: 1,
      validStatus: () => true,
      isTouchedOrDirty: () => true,
      getLangText: (tab) => {
        return this.lang.map[tab.langKey].change({ x: this.classification.getName() });
      }
    }
  };
  selectedTabIndex$: Subject<number> = new Subject<number>();
  defaultSelectedTab: string = 'basic';
  selectedTab: string = 'basic';
  get displayedColumns() {
    return this.readonly ? ['arName', 'enName', 'status'] : ['arName', 'enName', 'status', 'actions'];
  }
  subDacOchas: AdminLookup[] = [];
  addSubDacOcha$: Subject<any> = new Subject<any>();
  reloadSubDacOchas$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  actions: IMenuItem<AdminLookup>[] = [
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => false,
      onClick: (item) => this.delete(item)
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.edit(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      onClick: (item: AdminLookup) => this.toggleStatus(item),
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
      onClick: (item: AdminLookup) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }
  @ViewChild('table') table!: TableComponent;

  sortingCallbacks = {
    statusInfo: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusDateModified: (a: AdminLookup, b: AdminLookup, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.statusDateModified),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.statusDateModified);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
    previousPageIndex: null
  };

  pageChange($event: PageEvent): void {
    this.pageEvent = $event;
    if (this.usePagination && this.pageEvent.previousPageIndex !== null) {
      this.reloadSubDacOchas$.next(this.reloadSubDacOchas$.value);
    }
  }

  initPopup(): void {
    this.listenToAddSubDacOcha();
    this.listenToReloadSubDacOchas();
  }

  ngAfterViewInit() {
    this._setDefaultSelectedTab();
    this.cd.detectChanges();
  }

  private _setDefaultSelectedTab(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.defaultSelectedTab) && this.tabsData[this.defaultSelectedTab]) {
        this.selectedTabIndex$.next(this.tabsData[this.defaultSelectedTab].index);
      }
    });
  }

  popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_dac_ocha.change({ x: this.classification.getName() }) :
      this.lang.map.edit_dac_ocha.change({ x: this.classification.getName() });
  };

  tabChanged(tab: TabComponent) {
    this.selectedTab = tab.name;
    this.setDialogButtonsVisibility(tab);
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  beforeSave(model: AdminLookup, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: AdminLookup, form: UntypedFormGroup): Observable<AdminLookup> | AdminLookup {
    const record = (new AdminLookup()).clone({ ...model, ...form.value });
    record.type = this.model.type;
    return record;
  }

  afterSave(model: AdminLookup, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    const operationBeforeSave = this.operation;
    this.operation = OperationTypes.UPDATE;

    if (operationBeforeSave == OperationTypes.UPDATE) {
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  edit(item: AdminLookup): void {
    const sub = this.dacOchaService.openUpdateDialog(item.id, 'basic').subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reloadSubDacOchas$.next(null);
        sub.unsubscribe();
      });
    });
  }

  toggleStatus(model: AdminLookup) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reloadSubDacOchas$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reloadSubDacOchas$.next(null);
      });
  }

  delete(model: AdminLookup): void {
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete(model.type).subscribe(() => {
            // @ts-ignore
            this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
            this.reloadSubDacOchas$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  listenToAddSubDacOcha() {
    this.addSubDacOcha$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.dacOchaService.openCreateDialog(this.model.type, this.model.id).onAfterClose$))
      .subscribe(() => this.reloadSubDacOchas$.next(null));
  }

  listenToReloadSubDacOchas() {
    this.reloadSubDacOchas$
      .pipe(
        takeUntil(this.destroy$),
        filter(val => val !== 'init'),
        filter(() => !this.model.parentId) // only load if it is not children as children will never have grid
      )
      .subscribe(() => {
        let load: Observable<AdminLookup[]>;
        if (this.usePagination) {
          const paginationOptions = {
            limit: this.pageEvent.pageSize,
            offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
          };
          load = this.dacOchaService.loadByParentIdPaging(paginationOptions, this.model.id)
            .pipe(map((res) => {
              this.count = res.count;
              return res.rs;
            }));
        } else {
          load = this.dacOchaService.loadByParentId(this.model.id);
        }

        load.pipe(takeUntil(this.destroy$),)
          .subscribe(result => {
            this.subDacOchas = result;
            this.table && this.table.clearSelection();
          });
      });
  }

  destroyPopup(): void {

  }


}
