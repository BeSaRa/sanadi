import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { InternalDepartment } from '@app/models/internal-department';
import { InternalDepartmentService } from '@app/services/internal-department.service';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { LangService } from '@app/services/lang.service';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ToastService } from '@app/services/toast.service';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'internal-department',
  templateUrl: './internal-department.component.html',
  styleUrls: ['./internal-department.component.scss']
})
export class InternalDepartmentComponent extends AdminGenericComponent<InternalDepartment, InternalDepartmentService> {
  usePagination = true
  searchText = '';
  view$: Subject<InternalDepartment> = new Subject<InternalDepartment>();
  commonStatusEnum = CommonStatusEnum;

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
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];

  constructor(public lang: LangService, public service: InternalDepartmentService,
              private toast: ToastService) {
    super();
  }

  sortingCallbacks = {
    statusInfo: (a: InternalDepartment, b: InternalDepartment, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  ngOnInit() {
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
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

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }
}
