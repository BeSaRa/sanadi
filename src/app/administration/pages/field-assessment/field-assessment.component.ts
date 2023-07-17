import {Component, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {FieldAssessment} from '@app/models/field-assessment';
import {FieldAssessmentService} from '@services/field-assessment.service';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {SharedService} from '@services/shared.service';
import {ToastService} from '@services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {of, Subject} from 'rxjs';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {IGridAction} from '@contracts/i-grid-action';
import {SortEvent} from '@contracts/sort-event';
import {CommonUtils} from '@helpers/common-utils';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'field-assessment',
  templateUrl: './field-assessment.component.html',
  styleUrls: ['./field-assessment.component.scss']
})
export class FieldAssessmentComponent extends AdminGenericComponent<FieldAssessment, FieldAssessmentService> {
  usePagination = true;

  constructor(public lang: LangService,
              public service: FieldAssessmentService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService,
              private lookupService: LookupService,
              private fb: FormBuilder) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();

  }

  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'type', 'status', 'statusDateModified', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_type', 'search_status','search_statusDateModified', 'search_actions'];
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
    search_type:{
      key: 'type',
      controlType: 'select',
      property: 'type',
      label: 'type',
      selectOptions:{
        options:this.lookupService.listByCategory.FieldAssessment,
        labelProperty:'getName',
        optionValueKey:'lookupKey'
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
    }
  }

  view$: Subject<FieldAssessment> = new Subject<FieldAssessment>();
  actions: IMenuItem<FieldAssessment>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: FieldAssessment) => this.edit$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => false,
      onClick: (item: FieldAssessment) => this.delete(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item: FieldAssessment) => this.view$.next(item)
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      show: () => true,
      onClick: (item: FieldAssessment) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: FieldAssessment) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: FieldAssessment) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      show: () => false,
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
          show: (_items: FieldAssessment[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, _data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (_items: FieldAssessment[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    typeInfo: (a: FieldAssessment, b: FieldAssessment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.typeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.typeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusInfo: (a: FieldAssessment, b: FieldAssessment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  get selectedRecords(): FieldAssessment[] {
    return this.table.selection.selected;
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.openViewDialog(model.id).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  delete(model: FieldAssessment): void {
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

  toggleStatus(model: FieldAssessment) {
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
  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], type: [null], status: [null]
    })
  }

}
