import { UserClickOn } from '@app/enums/user-click-on.enum';
import { ToastService } from '@app/services/toast.service';
import { SharedService } from '@app/services/shared.service';
import { LangService } from '@app/services/lang.service';
import { takeUntil, exhaustMap, catchError, filter, switchMap } from 'rxjs/operators';
import { SortEvent } from '@app/interfaces/sort-event';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { Component, ViewChild } from '@angular/core';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Subject, of } from 'rxjs';
import { SubTeam } from '@app/models/sub-team';
import { SubTeamService } from '@app/services/sub-team.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogService } from '@app/services/dialog.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { FormBuilder } from '@angular/forms';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'app-sub-team',
  templateUrl: './sub-team.component.html',
  styleUrls: ['./sub-team.component.scss']
})
export class SubTeamComponent extends AdminGenericComponent<SubTeam, SubTeamService> {
  usePagination = true;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions']; //, 'parent'
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_status', 'search_actions'];
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
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  @ViewChild('table') table!: TableComponent;
  view$: Subject<SubTeam> = new Subject<SubTeam>();

  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<SubTeam>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: SubTeam) => this.edit$.next(item)
    },
    // delete
    // {
    //   type: 'action',
    //   label: 'btn_delete',
    //   icon: ActionIconsEnum.DELETE,
    //   onClick: (item: SubTeam) => this.delete(item)
    // },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: SubTeam) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: SubTeam) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: SubTeam) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];

  bulkActionsList: IGridAction[] = [
    // {
    //   langKey: 'btn_delete',
    //   icon: 'mdi-close-box',
    //   callback: ($event: MouseEvent) => {
    //     this.deleteBulk($event);
    //   }
    // },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: SubTeam[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: SubTeam[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: SubTeam, b: SubTeam, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(public lang: LangService,
    public service: SubTeamService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService,
    private fb: FormBuilder,
    private lookupService:LookupService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm()
  }

  get selectedRecords(): SubTeam[] {
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

  delete(model: SubTeam, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName() });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
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

  toggleStatus(model: SubTeam) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        // this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }
}
