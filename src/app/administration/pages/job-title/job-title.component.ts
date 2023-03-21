import {FormBuilder} from '@angular/forms';
import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {JobTitle} from '@app/models/job-title';
import {JobTitleService} from '@app/services/job-title.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {ToastService} from '@app/services/toast.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {LookupService} from '@app/services/lookup.service';
import {CustomValidators} from '@app/validators/custom-validators';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';

@Component({
  selector: 'job-title',
  templateUrl: './job-title.component.html',
  styleUrls: ['./job-title.component.scss']
})
export class JobTitleComponent extends AdminGenericComponent<JobTitle, JobTitleService> {
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  usePagination = true;

  constructor(public lang: LangService,
              public service: JobTitleService,
              private dialogService: DialogService,
              private sharedService: SharedService,
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
  view$: Subject<JobTitle> = new Subject<JobTitle>();

  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<JobTitle>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: JobTitle) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: JobTitle) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: JobTitle) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: JobTitle) => this.toggleStatus(item),
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
      onClick: (item: JobTitle) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
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
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: JobTitle[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: JobTitle[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: JobTitle, b: JobTitle, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  get selectedRecords(): JobTitle[] {
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
      arName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
      status: [null]
    })
  }

  /*getColumnFilterValue(): Partial<JobTitle> {
    const value: Partial<JobTitle> = this.columnFilterForm.value;
    if (this.columnFilterFormHasValue(value)) {
      value.isSystem = false;
      return value;
    }
    return {};
  }*/

  delete(model: JobTitle, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe((status:boolean) => {
          // @ts-ignore
          // this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          if(status) this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName() }));
          else this.toast.error(this.lang.map.msg_record_is_linked)
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

  toggleStatus(model: JobTitle) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
    .subscribe((res:{sc:number, rs:boolean}) => {
        // this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        if (res.rs) this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        else this.toast.error(this.lang.map.msg_record_is_linked);
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({ x: model.getName() }));
        this.reload$.next(null);
      });
  }
}
