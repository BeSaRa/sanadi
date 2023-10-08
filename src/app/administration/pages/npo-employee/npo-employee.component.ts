import { FormBuilder } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import { TableComponent } from '@app/shared/components/table/table.component';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { LookupService } from '@app/services/lookup.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { NpoEmployee } from '@app/models/npo-employee';
import { NpoEmployeeService } from '@app/services/npo-employee.service';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'npo-employee',
  templateUrl: './npo-employee.component.html',
  styleUrls: ['./npo-employee.component.scss']
})
export class NpoEmployeeComponent extends AdminGenericComponent<NpoEmployee, NpoEmployeeService> {
  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  usePagination = true;

  @ViewChild('table') table!: TableComponent;
  view$: Subject<NpoEmployee> = new Subject<NpoEmployee>();

  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<NpoEmployee>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item: NpoEmployee) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item: NpoEmployee) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      onClick: (item: NpoEmployee) => this.toggleStatus(item),
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
      onClick: (item: NpoEmployee) => this.toggleStatus(item),
      displayInGrid: false,
      show: (item) => {
        return item.status !== CommonStatusEnum.RETIRED && item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];

  displayedColumns: string[] = ['rowSelection', 'identificationType', 'qId', 'passportNumber', 'arName', 'enName', 'department', 'jobTitleName', 'status', 'actions'];
  searchColumns: string[] = ['_', 'search_identificationType', 'search_qId', 'search_passportNumber', 'search_arName', 'search_enName', 'search_department', 'search_jobTitleName', 'search_status', 'search_actions'];

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
    },
    search_identificationType: {
      key: 'identificationType',
      controlType: 'select',
      property: 'identificationType',
      label: 'identification_type',
      selectOptions: {
        options: this.lookupService.listByCategory.IdentificationType,
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    },
    search_qId: {
      key: 'qId',
      controlType: 'text',
      property: 'qId',
      label: 'lbl_qid',
      mask: CustomValidators.inputMaskPatterns.NUMBER_ONLY
    },
    search_passportNumber: {
      key: 'passportNumber',
      controlType: 'text',
      property: 'passportNumber',
      label: 'passport_number',
      mask: CustomValidators.inputMaskPatterns.NUMBER_ONLY
    },
    search_department: {
      key: 'department',
      controlType: 'text',
      property: 'department',
      label: 'department',
    },
    search_jobTitleName: {
      key: 'jobTitleName',
      controlType: 'text',
      property: 'jobTitleName',
      label: 'job_title',
    },
  }

  sortingCallbacks = {
    statusInfo: (a: NpoEmployee, b: NpoEmployee, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    nationalityInfo: (a: NpoEmployee, b: NpoEmployee, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.nationalityInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.nationalityInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    identificationTypeInfo: (a: NpoEmployee, b: NpoEmployee, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.identificationTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.identificationTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  constructor(public lang: LangService,
    public service: NpoEmployeeService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private toast: ToastService) {
    super();
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
  }

  get selectedRecords(): NpoEmployee[] {
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
      arName: [''],
      enName: [''],
      qId: [''],
      passportNumber: [''],
      department: [''],
      jobTitleName: [''],
      status: [null],
      identificationType: [null],
    })
  }
  toggleStatus(model: NpoEmployee) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({ x: model.getName() }));
        this.reload$.next(null);
      }, () => {
        this.reload$.next(null);
      });
  }
}
