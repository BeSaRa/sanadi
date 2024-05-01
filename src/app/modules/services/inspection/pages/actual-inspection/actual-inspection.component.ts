import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';
import { ActualInceptionStatus } from '@app/enums/actual-inspection-status.enum';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { SortEvent } from '@app/interfaces/sort-event';
import { ActualInspection } from '@app/models/actual-inspection';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommentPopupComponent } from '@app/shared/popups/comment-popup/comment-popup.component';
import { TabMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, of, timer } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-actual-inspection',
  templateUrl: './actual-inspection.component.html',
  styleUrls: ['./actual-inspection.component.scss'],
})
export class ActualInspectionComponent  extends AdminGenericComponent<ActualInspection, ActualInspectionService>{
  usePagination = true;
  actions: IMenuItem<ActualInspection>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: ActualInspection) => this.view$.next(item),
      show:  (item: ActualInspection) =>  [ActualInceptionStatus.CANCELED,ActualInceptionStatus.COMPLETED].includes(item.status)

    },
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ActualInspection) => this.edit$.next(item),
      show:  (item: ActualInspection) =>  ![ActualInceptionStatus.CANCELED,ActualInceptionStatus.COMPLETED].includes(item.status)

    },
    // reject
    {
      type: 'action',
      label: 'cancel_task',
      icon: ActionIconsEnum.BLOCK,
      onClick: (item: ActualInspection) => this.reject(item),
      show:  (item: ActualInspection) =>  ![ActualInceptionStatus.CANCELED,ActualInceptionStatus.COMPLETED].includes(item.status)
      
    },
    // copy
    {
      type: 'action',
      label: 'btn_copy_task',
      icon: ActionIconsEnum.PRINT,
      onClick: (item: ActualInspection) => this.service.copyDialog(ActualInspection.prepareCopy(item))
      .onAfterClose$
      .pipe(take(1))
      
      .subscribe(() => this.reload$.next(null)),
      
    },
  ];

  displayedColumns: string[] = [ 'taskSerialNumber', 'operationDescription','mainOperationType', 'subOperationType', 'status','inspectorId','actions'];
  searchColumns: string[] = [ 'search_taskSerialNumber', 'search_operationDescription', '_','__','search_status','___' ,'search_actions'];
  
  onTabChange($event: TabComponent) {
  }
  tabIndex$: Subject<number> = new Subject<number>();
  tabsData: TabMap = {
    actualInspection: {
      name: 'actualInspectionTab',
      langKey: 'menu_actual_inspection',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus :()=> true
    },
    proposedInspection: {
      name: 'proposedInspectionTab',
      langKey: 'menu_proposed_inspection',
      index: 1,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    },
  };

  view$: Subject<ActualInspection> = new Subject<ActualInspection>();
  constructor(public service: ActualInspectionService,
    public lang: LangService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private dialogService: DialogService,
  private employeeService: EmployeeService) {
    super();
    

  }
  searchColumnsConfig: SearchColumnConfigMap = {
    search_taskSerialNumber: {
      key: 'taskSerialNumber',
      controlType: 'text',
      property: 'taskSerialNumber',
      label: 'serial_number',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_operationDescription: {
      key: 'operationDescription',
      controlType: 'text',
      property: 'operationDescription',
      label: 'lbl_operation_description',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
      
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
    },
    search_main: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.InspectionTaskStatus,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    },
    search_inspectorId: {
      key: 'inspectorId',
      controlType: 'text',
      property: 'inspectorId',
      label: 'lbl_inspector',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
  }

  protected _init(): void {
    this.listenToView();

    this.buildFilterForm();
  }
  sortingCallbacks = {

    mainOperation: (a: ActualInspection, b: ActualInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.mainOperationInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.mainOperationInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    subOperation: (a: ActualInspection, b: ActualInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.subOperationInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.subOperationInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    inspector: (a: ActualInspection, b: ActualInspection, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.inspectorInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.inspectorInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    status: (a: ActualInspection, b: ActualInspection, dir: SortEvent): number => {
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
      taskSerialNumber: [null], operationDescription: [null], inspectorId: [null], status: [ActualInceptionStatus.TABULATED],
      departmentId:[this.employeeService.getInternalDepartment()?.id]
    })
    timer(0)
    .subscribe(_=>this.columnFilter$.next('filter'))
  }
  reject(model: ActualInspection, event?: MouseEvent): void {
    event?.preventDefault();
    this.dialogService.show(CommentPopupComponent)
    .onAfterClose$
    .pipe(
        take(1),
        switchMap((comment: string) => {
            return this.service.reject(model, comment)
        })

    ).subscribe(_ => {
        this.reload$.next(null)
    })
  }
  @ViewChild('table') table!: TableComponent;
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  getActualInspectionIcon(model:ActualInspection):string{

    return model.creationSource === ActualInspectionCreationSource.PROPOSED_TASK_SOURCE ? 'mdi-file-sign' :
    model.creationSource === ActualInspectionCreationSource.ACTUAL_TASK_SOURCE ? 'mdi-file-chart-check-outline':
    model.creationSource === ActualInspectionCreationSource.FOLLOW_UP_SOURCE ? 'mdi-file-eye-outline':
    ''

  }
  getActualInspectionToolTip(model:ActualInspection):string{

    return model.creationSource === ActualInspectionCreationSource.PROPOSED_TASK_SOURCE ? this.lang.map.lbl_proposed_inspection_task :
    model.creationSource === ActualInspectionCreationSource.ACTUAL_TASK_SOURCE ? this.lang.map.lbl_actual_inspection_task:
    model.creationSource === ActualInspectionCreationSource.FOLLOW_UP_SOURCE ? this.lang.map.lbl_follow_up_inspection_task:
    ''

  }
 
}

