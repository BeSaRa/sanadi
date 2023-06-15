import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { Permission } from '@app/models/permission';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { PermissionService } from '@app/services/permission.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, of } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'admin-permission',
    templateUrl: 'admin-permission.component.html',
    styleUrls: ['admin-permission.component.scss']
})
export class AdminPermissionComponent extends AdminGenericComponent<Permission, PermissionService> {
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  usePagination = true;

  constructor(public lang: LangService,
              public service: PermissionService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  @ViewChild('table') table!: TableComponent;
  view$: Subject<Permission> = new Subject<Permission>();

  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<Permission>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: Permission) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: Permission) => this.view$.next(item)
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      show:()=>false,
      onClick: (item: Permission) => this.showAuditLogs(item)
    },


  ];
  displayedColumns: string[] = [ 'arName', 'enName', 'category','groupId' ,'actions'];
  searchColumns: string[] = [ 'search_arName', 'search_enName', 'search_category','_' ,'search_actions'];
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
    search_category: {
      key: 'category',
      controlType: 'select',
      property: 'category',
      label: 'lbl_category',
      selectOptions: {
        options: this.lookupService.listByCategory.PermissionCategory,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }


  sortingCallbacks = {
    categoryInfo: (a: Permission, b: Permission, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.categoryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.categoryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  get selectedRecords(): Permission[] {
    return this.table.selection.selected;
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)))
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], category: [null]
    })
  }

  /*getColumnFilterValue(): Partial<Permission> {
    const value: Partial<Permission> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.isSystem = false;
      return value;
    }
    return {};
  }*/

 }
