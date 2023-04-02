import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {SDGoal} from '@app/models/sdgoal';
import {SDGoalService} from '@app/services/sdgoal.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {SharedService} from '@app/services/shared.service';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {ToastService} from '@app/services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'sd-goal-list',
  templateUrl: './sd-goal-list.component.html',
  styleUrls: ['./sd-goal-list.component.scss']
})
export class SdGoalListComponent extends AdminGenericComponent<SDGoal, SDGoalService> implements OnInit {
  @Input() parentId?: number;
  @Input() readonly: boolean = false;
  usePagination = true;
  displayedColumns = ['arName', 'enName', 'status', 'actions'];
  searchColumns: string[] = ['search_arName', 'search_enName', 'search_status', 'search_actions'];
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

  commonStatusEnum = CommonStatusEnum;
  view$: Subject<SDGoal> = new Subject<SDGoal>();
  actions: IMenuItem<SDGoal>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly,
      onClick: (item: SDGoal) => this.edit(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: SDGoal) => this.view$.next(item)
    },
    // children
    {
      type: 'action',
      label: 'sub_lists',
      icon: ActionIconsEnum.CHILD_ITEMS,
      show: (item) => !item.parentId,
      onClick: (item) => this.showChildren(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: SDGoal) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && !item.status;
      },
      displayInGrid: false
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: SDGoal) => this.toggleStatus(item),
      show: (item) => {
        return !this.readonly && !!item.status;
      },
      displayInGrid: false
    }
  ];
  @ViewChild('table') table!: TableComponent;
  selectedPopupTabName: string = 'basic';

  sortingCallbacks = {
    statusInfo: (a: SDGoal, b: SDGoal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  constructor(public service: SDGoalService,
              private sharedService: SharedService,
              public lang: LangService,
              public dialogService: DialogService,
              private toast: ToastService,
              private lookupService:LookupService,
              private fb:FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  get selectedRecords(): SDGoal[] {
    return this.table.selection.selected;
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.parentId).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(() => !this.readonly))
      .pipe(exhaustMap((model) => {
        return this.service.openUpdateDialog(model.id, this.selectedPopupTabName).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
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

  private _getSubRecordsRequest(columnFilterCriteria: Partial<SDGoal>) {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };

    let normalRequest = this.service.loadSubSdGoals(this.parentId!);
    let pagingRequest = this.service.loadSubSdGoalsPaginate(paginationOptions, this.parentId!);

    return {normalRequest, pagingRequest};
  }

  private _getMainRecordsRequest(columnFilterCriteria: Partial<SDGoal>) {
    const paginationOptions = {
      limit: this.pageEvent.pageSize,
      offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
    };

    let normalRequest = this.service.loadMainSdGoals();
    let pagingRequest = this.service.loadMainSdGoalsPaginate(paginationOptions);

    return {normalRequest, pagingRequest};
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(
        map(() => {
          let request = this.parentId ? this._getSubRecordsRequest({}) : this._getMainRecordsRequest({});

          if (this.usePagination) {
            return request.pagingRequest.pipe(
              map((res) => {
                this.count = res.count;
                return res.rs;
              }));
          } else {
            return request.normalRequest.pipe(map((res) => {
              this.count = res.length;
              return res;
            }));
          }
        }),
        switchMap((finalRequest) => {
          return finalRequest.pipe(
            catchError(() => {
              this.count = 0;
              return of([]);
            })
          );
        }))
      .subscribe((list: SDGoal[]) => {
        this.models = list;
        this.afterReload();
      })
  }

  edit(sdGoal: SDGoal, event?: MouseEvent) {
    if (this.readonly) {
      return;
    }
    event?.preventDefault();
    this.selectedPopupTabName = 'basic';
    this.edit$.next(sdGoal);
  }

  delete(model: SDGoal): void {
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((click: UserClickOn) => {
          return click === UserClickOn.YES ? model.delete() : of(null);
        }))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
        this.reload$.next(null);
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

          this.service.deleteBulk(ids)
            .pipe(
              takeUntil(this.destroy$),
              exhaustMap((response) => {
                return this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response).pipe(takeUntil(this.destroy$));
              }))
            .subscribe(() => {
              this.reload$.next(null);
            });
        }
      });
    }
  }

  toggleStatus(model: SDGoal) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }

  showChildren(item: SDGoal, $event?: Event): void {
    $event?.preventDefault();
    this.selectedPopupTabName = 'children';

    if (this.readonly) {
      this.view$.next(item);
    } else {
      this.edit$.next(item);
    }
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }
}
