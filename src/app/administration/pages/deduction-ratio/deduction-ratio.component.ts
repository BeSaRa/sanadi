import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { DeductionRatioItem } from '@app/models/deduction-ratio-item';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DeductionRatioItemService } from '@app/services/deduction-ratio-item.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { SharedService } from '@app/services/shared.service';
import { ToastService } from '@app/services/toast.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { of, Subject } from 'rxjs';
import { exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'deduction-ratio',
  templateUrl: './deduction-ratio.component.html',
  styleUrls: ['./deduction-ratio.component.scss']
})

export class DeductionRatioComponent extends AdminGenericComponent<DeductionRatioItem, DeductionRatioItemService>  {
  usePagination = true;
  @ViewChild('table') table!: TableComponent;
  view$: Subject<DeductionRatioItem> = new Subject<DeductionRatioItem>();
  commonStatusEnum = CommonStatusEnum;
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
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  constructor(public lang: LangService,
              public service: DeductionRatioItemService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              private lookupService:LookupService,
              private fb:FormBuilder) {
    super();
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  actions: IMenuItem<DeductionRatioItem>[] = [
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: DeductionRatioItem) => this.edit$.next(item)
    },
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: DeductionRatioItem) => this.delete(item)
    },
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: DeductionRatioItem) => this.view$.next(item)
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      show: () => false,
      label: 'show_logs',
      onClick: (item: DeductionRatioItem) => this.showAuditLogs(item)
    },
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: DeductionRatioItem) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      onClick: (item: DeductionRatioItem) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
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
          show: (_items: DeductionRatioItem[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: DeductionRatioItem[]) => {
            return true;
          }
        }
      ],
    }
  ];


  get selectedRecords(): DeductionRatioItem[] {
    return this.table.selection.selected;
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {return this.service.openViewDialog(model.id)}))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  delete(model: DeductionRatioItem, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({ x: model.getName(this.lang.map.lang) });
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          this.toast.success(this.lang.map.msg_delete_x_success.change({ x: model.getName(this.lang.map.lang) }));
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

  toggleStatus(model: DeductionRatioItem) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName(this.lang.map.lang) }));
        this.reload$.next(null);
      }, () => {
        this.reload$.next(null);
      });
  }
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], status: [null]
    })
  }
}
