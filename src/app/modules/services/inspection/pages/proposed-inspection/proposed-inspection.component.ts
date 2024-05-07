import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';
import { ActualInceptionStatus } from '@app/enums/actual-inspection-status.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { ActualInspection } from '@app/models/actual-inspection';
import { InternalDepartment } from '@app/models/internal-department';
import { ProposedInspection } from '@app/models/proposed-inspection';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ProposedInspectionService } from '@app/services/proposed-inspection.service';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommentPopupComponent } from '@app/shared/popups/comment-popup/comment-popup.component';
import { Subject, of, timer } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'proposed-inspection',
  templateUrl: 'proposed-inspection.component.html',
  styleUrls: ['proposed-inspection.component.scss'],
})
export class ProposedInspectionComponent extends AdminGenericComponent<ProposedInspection, ProposedInspectionService> {

  usePagination = true;
  @Input() isApproval = false;
  @Output() actualInspectionCreated = new EventEmitter()
  departments$:Subject<InternalDepartment[]> = new Subject<InternalDepartment[]>();
  readonlyStatuses = [ActualInceptionStatus.COMPLETED, ActualInceptionStatus.CANCELED, ActualInceptionStatus.REJECTED, ActualInceptionStatus.IN_PROGRESS]
  actions: IMenuItem<ProposedInspection>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: ProposedInspection) => this.view$.next(item)
    },
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ProposedInspection) => this.edit$.next(item),
      show: () => !this.isApproval
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      onClick: (item: ProposedInspection) => this.delete(item),
      show: () => !this.isApproval
    },
    // approve
    {
      type: 'action',
      label: 'approve',
      icon: ActionIconsEnum.APPROVE,
      onClick: (item: ProposedInspection) => this.approve(item),
      show: (item) => this.isApproval && !this.readonlyStatuses.includes(item.status)
    },
    // reject
    {
      type: 'action',
      label: 'lbl_reject',
      icon: ActionIconsEnum.BLOCK,
      onClick: (item: ProposedInspection) => this.reject(item),
      show: (item) => this.isApproval && !this.readonlyStatuses.includes(item.status)
    },
  ];

  displayedColumns: string[] = ['proposedTaskType', 'priority', 'departmentId', 'status', 'actions'];
  searchColumns: string[] = [];


  view$: Subject<ProposedInspection> = new Subject<ProposedInspection>();
  constructor(public service: ProposedInspectionService,
    public lang: LangService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private actualInspectionService: ActualInspectionService,
    private internalDepartmentService:InternalDepartmentService
  ) {
    super();
   

  }
  searchColumnsConfig: SearchColumnConfigMap = {
    search_proposedTaskType: {
      key: 'proposedTaskType',
      controlType: 'select',
      property: 'proposedTaskType',
      label: 'lbl_proposed_task',
      selectOptions: {
        options: this.lookupService.listByCategory.ProposedInspectionTaskType,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    },
    search_priority: {
      key: 'priority',
      controlType: 'select',
      property: 'priority',
      label: 'lbl_priority',
      selectOptions: {
        options: this.lookupService.listByCategory.PriorityType,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    },
    search_departments: {
      key: 'departmentId',
      controlType: 'select',
      property: 'departmentId',
      label: 'department',
      selectOptions: {
        options$: this.departments$,
        labelProperty: 'getName',
        optionValueKey: 'id'
      }
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.InspectionTaskStatus,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  protected _init(): void {
    this.internalDepartmentService.loadActive()
    .pipe(
      tap(list=>{
        this.departments$.next(list)
      }),
      take(1)
    ).subscribe()
    this.listenToView();
   this.searchColumns= this.isApproval?
    ['search_proposedTaskType', 'search_priority', 'search_departments', 'search_status', 'search_actions']:
    ['search_proposedTaskType', 'search_priority', '_', 'search_status', 'search_actions'];
    this.buildFilterForm();

  }
  sortingCallbacks = {

    department: (a: ProposedInspection, b: ProposedInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.departmentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.departmentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    proposedTaskType: (a: ProposedInspection, b: ProposedInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.proposedTaskTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.proposedTaskTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    priority: (a: ProposedInspection, b: ProposedInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.priorityInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.priorityInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: ProposedInspection, b: ProposedInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
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
      proposedTaskType: [null], priority: [null], status: [null],departmentId:[null],
    })
    // timer(200)
    // .subscribe(_ => this.columnFilter$.next('filter'))
  }
  delete(model: ProposedInspection, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({ x: this.lang.map.lbl_proposed_task });
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
  @ViewChild('table') table!: TableComponent;
  afterReload(): void {
    this.table && this.table.clearSelection();
  }
  approve(item: ProposedInspection): void {
    this.actualInspectionService
      .showCreateActualInspectionPopup(ActualInspectionCreationSource.PROPOSED_TASK_SOURCE,
        ActualInspection.mapFromProposedInspection(item))
      .pipe(
        take(1),
      ).subscribe(model => {
        if(model){
          this.actualInspectionCreated.emit(model);
        }
      })

  }
  reject(item: ProposedInspection): void {
    this.dialogService.show(CommentPopupComponent)
      .onAfterClose$.pipe(
        take(1),
        filter((comment) => !!comment),
        switchMap((comment) => this.service.reject(item, comment))
      ).subscribe();
  }
}
