import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { Followup } from '@app/models/followup';
import { FollowupService } from '@app/services/followup.service';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Subject } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { ToastService } from '@app/services/toast.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { FollowupStatusEnum } from '@app/enums/status.enum';
import { SortEvent } from "@contracts/sort-event";
import { CommonUtils } from "@helpers/common-utils";
import { CommonService } from "@services/common.service";

@Component({
  selector: 'internal-followup',
  templateUrl: './internal-followup.component.html',
  styleUrls: ['./internal-followup.component.scss']
})
export class InternalFollowupComponent extends AdminGenericComponent<Followup, FollowupService> {
  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['fullSerial', 'requestType', 'name', 'serviceType', 'dueDate', 'createdBy', 'status', 'actions'];
  headerColumn: string[] = ['extra-header'];
  searchText = '';
  add$: Subject<any> = new Subject<any>();
  sortCallbacks = {
    requestType: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.requestTypeInfo.getName(), b.requestTypeInfo.getName(), d.direction);
    },
    name: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.getName(), b.getName(), d.direction);
    },
    service: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.serviceInfo.getName(), b.serviceInfo.getName(), d.direction);
    },
    createdBy: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.getCreatedBy(), b.getCreatedBy(), d.direction);
    },
    status: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.statusInfo.getName(), b.statusInfo.getName(), d.direction);
    },
    organization: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.orgInfo.getName(), b.orgInfo.getName(), d.direction);
    }
  }

  constructor(public service: FollowupService,
              public lang: LangService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
              private commonService: CommonService,
              private toast: ToastService) {
    super();
  }

  _init() {
    this.reload$.next(1);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        return this.service.getFollowupsByType('internal');
      }))
      .pipe(
        //@BeSaRa - this antipattern , I made it for reason
        tap(() => this.commonService.loadCounters().subscribe())
      )
      .subscribe((list: Followup[]) => {
        this.models = list;
      });
  }

  terminate(model: Followup, $event: MouseEvent) {
    $event.preventDefault();
    const message = this.lang.map.msg_confirm_terminate_followup;
    this.dialog.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = this.service.terminate(model.id).subscribe(() => {
          this.toast.success(this.lang.map.msg_success_terminate_followup);
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });

  }

  showComments(model: Followup, _$event: MouseEvent) {
    this.dialog.show(this.service._getCommentsDialogComponent(), model);
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  getDateColor(dueDate: any): 'red' | 'blue' | 'green' {
    dueDate = (new Date(dueDate.split('T')[0]).setHours(0, 0, 0, 0));
    let currentDate = (new Date().setHours(0, 0, 0, 0));

    if (dueDate < currentDate)
      return 'red';
    else if (dueDate > currentDate)
      return 'green';
    else
      return 'blue'
  }

  isDisabled(row: Followup): boolean {
    return [FollowupStatusEnum.PARTIAL_TERMINATION, FollowupStatusEnum.TERMINATED].includes(row.status) && !this.employeeService.isInternalUser()
  }
}
