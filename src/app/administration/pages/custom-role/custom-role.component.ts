import {Component, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {ExternalUserCustomRoleService} from '@services/external-user-custom-role.service';
import {CustomRole} from '@app/models/custom-role';
import {takeUntil} from 'rxjs/operators';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {SharedService} from '@app/services/shared.service';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {TableComponent} from '@app/shared/components/table/table.component';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { FormBuilder } from '@angular/forms';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'app-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.scss']
})
export class CustomRoleComponent extends AdminGenericComponent<CustomRole, ExternalUserCustomRoleService> {
  usePagination = true;

  constructor(public langService: LangService,
              private dialogService: DialogService,
              public service: ExternalUserCustomRoleService,
              private toast: ToastService,
              private sharedService: SharedService,
              private fb: FormBuilder,
              private lookupService: LookupService) {
    super();
  }

  useCompositeToLoad = false;
  useCompositeToEdit = false;
  @ViewChild('table') table!: TableComponent;

  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_status', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
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
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  actions: IMenuItem<CustomRole>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: CustomRole) => this.edit(item)
    },
    // delete
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: CustomRole) => this.delete(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: CustomRole) => this.toggleStatus(item),
      show: (item) => !item.status
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: CustomRole) => this.toggleStatus(item),
      show: (item) => item.status
    }
  ];

  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: CustomRole, b: CustomRole, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  _init(): void {
    this.listenToLoadDone();
    this.buildFilterForm();

  }

  get selectedRecords(): CustomRole[] {
    return this.table.selection.selected;
  }

  listenToLoadDone(): void {
    this.service._loadDone$
      .pipe(takeUntil((this.destroy$)))
      .subscribe(() => {
        this.table && this.table.clearSelection();
      });
  }

  edit(model: CustomRole, event?: MouseEvent): void {
    event?.preventDefault();
    this.edit$.next(model);
  }

  delete(model: CustomRole, event?: MouseEvent): void {
    event?.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: model.getName()})).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
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

  toggleStatus(model: CustomRole) {
    model.toggleStatus().update()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // @ts-ignore
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        // @ts-ignore
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }

  getColumnFilterValue(): Partial<CustomRole> {
    const value = this.columnFilterForm.value;
    return {...value, status: value.status===1 ? true: value.status===0 ? false: null}
  }
}
