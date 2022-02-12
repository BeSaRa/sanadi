import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {InternalDepartment} from '@app/models/internal-department';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {catchError, exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {ToastService} from '@app/services/toast.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'internal-department',
  templateUrl: './internal-department.component.html',
  styleUrls: ['./internal-department.component.scss']
})
export class InternalDepartmentComponent extends AdminGenericComponent<InternalDepartment, InternalDepartmentService> {
  searchText = '';
  view$: Subject<InternalDepartment> = new Subject<InternalDepartment>();
  commonStatusEnum = CommonStatusEnum;

  actions: IMenuItem<InternalDepartment>[] = [
    // reload
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: 'mdi-eye',
      onClick: (item) => this.view$.next(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item) => this.toggleStatus(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
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

  edit(department: InternalDepartment, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(department);
  }

  view(department: InternalDepartment, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(department);
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }

  toggleStatus(model: InternalDepartment) {
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
}
