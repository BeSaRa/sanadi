import { GeneralProcess } from '@app/models/genral-process';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { takeUntil, exhaustMap, catchError, filter, switchMap } from 'rxjs/operators';
import { Component, ViewChild } from '@angular/core';
import { Subject, of } from 'rxjs';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { TableComponent } from '@app/shared/components/table/table.component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { GeneralProcessService } from '@app/services/general-process.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { LangService } from '@app/services/lang.service';
import { DialogService } from '@app/services/dialog.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { FormBuilder } from '@angular/forms';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';

@Component({
  selector: 'app-general-process',
  templateUrl: './general-process.component.html',
  styleUrls: ['./general-process.component.scss']
})
export class GeneralProcessComponent extends AdminGenericComponent<GeneralProcess, GeneralProcessService> {
  usePagination = true;
  list: GeneralProcess[] = [];
  commonStatusEnum = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;
  view$: Subject<GeneralProcess> = new Subject<GeneralProcess>();

  actions: IMenuItem<GeneralProcess>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: GeneralProcess) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: GeneralProcess) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: GeneralProcess) => this.toggleStatus(item),
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
      onClick: (item: GeneralProcess) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_actions'];
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
    }
  }
  bulkActionsList: IGridAction[] = [
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (_items: GeneralProcess[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: GeneralProcess[]) => {
            return true;
          }
        }
      ],
    }
  ];
  constructor(
    public lang: LangService,
    public service: GeneralProcessService,
    private dialogService: DialogService,
    private sharedService: SharedService,
    private toast: ToastService,
    private fb: FormBuilder,
  ) {
    super();
  }
  protected _init(): void {
    this.listenToView();
    this.buildFilterForm()
  }
  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  get selectedRecords(): GeneralProcess[] {
    return this.table.selection.selected;
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

  toggleStatus(model: GeneralProcess) {
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
      arName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
      enName: ['', [CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
    })
  }
}
