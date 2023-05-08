import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { InternalDepartment } from '@app/models/internal-department';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@app/services/toast.service';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { FormBuilder } from '@angular/forms';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'internal-department',
  templateUrl: './internal-department.component.html',
  styleUrls: ['./internal-department.component.scss']
})
export class InternalDepartmentComponent extends AdminGenericComponent<InternalDepartment, InternalDepartmentService> {
  constructor(
    public lang: LangService,
    public service: InternalDepartmentService,
    private toast: ToastService,
    private fb: FormBuilder,
    private lookupService:LookupService ) {
    super();
  }
  usePagination = true
  view$: Subject<InternalDepartment> = new Subject<InternalDepartment>();

  actions: IMenuItem<InternalDepartment>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      onClick: (item) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item) => this.view$.next(item)
    },
     // logs
     {
      type: 'action',
      icon: ActionIconsEnum.HISTORY,
      label: 'show_logs',
      onClick: (item) => this.showAuditLogs(item)
    },
  ];

  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
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


  sortingCallbacks = {
    statusInfo: (a: InternalDepartment, b: InternalDepartment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  protected _init(): void {
    this.listenToView();
    this.buildFilterForm();
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
      arName: [''], enName: [''], status: [null]
    })
  }
}
