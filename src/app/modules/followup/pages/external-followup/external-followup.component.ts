import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { FollowupService } from '@app/services/followup.service';
import { Followup } from '@app/models/followup';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Subject } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { FollowupStatusEnum } from '@app/enums/status.enum';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { EmployeeService } from '@app/services/employee.service';
import { SortEvent } from "@contracts/sort-event";
import { CommonUtils } from "@helpers/common-utils";
import { CommonService } from "@services/common.service";
import {ActionIconsEnum} from "@enums/action-icons-enum";

@Component({
  selector: 'external-followup',
  templateUrl: './external-followup.component.html',
  styleUrls: ['./external-followup.component.scss']
})
export class ExternalFollowupComponent extends AdminGenericComponent<Followup, FollowupService> {
  actions: IMenuItem<Followup>[] = [
    // show comments
    {
      type: 'action',
      icon: ActionIconsEnum.COMMENT,
      label: 'comments',
      show:(item)=> !this.hasTerminatedRequest(item),
      onClick: (item: Followup) => this.showComments(item)
    },
    // terminate
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_terminate',
      show:(item)=> !this.hasTerminatedRequest(item),
      disabled:(item)=> this.isDisabled(item),
      onClick: (item: Followup) => this.terminate(item)
    },
    // reject terminate
    {
      type: 'action',
      icon: ActionIconsEnum.CANCEL,
      label: 'reject_terminate',
      show:(item)=> this.hasTerminatedRequest(item),
      disabled:(item)=> this.isDisabled(item),
      onClick: (item: Followup) => this.rejectTerminate(item)
    },
    // accept terminate
    {
      type: 'action',
      icon: ActionIconsEnum.ACCEPT,
      label: 'accept_terminate',
      show:(item)=> this.hasTerminatedRequest(item),
      disabled:(item)=> this.isDisabled(item),
      onClick: (item: Followup) => this.terminate(item)
    },
    // edit due date
    {
      type: 'action',
      icon: ActionIconsEnum.CHANGE_DATE,
      label: 'edit_due_date',
      show:(item)=> this.isInternalUser,
      onClick: (item: Followup) => this.editDueDate(item)
    },
    // reason
    {
      type: 'action',
      icon: 'mdi-alert-circle',
      label: (item)=> item.getReason(),
      show:(item)=> item.hasReason(),
      onClick: (item: Followup) => false
    }
  ];
  displayedColumns: string[] = ['fullSerial', 'requestType', 'name', 'serviceType', 'dueDate', 'createdBy', 'status', 'actions'];
  searchText = '';
  add$: Subject<any> = new Subject<any>();
  isInternalUser!: boolean;
  headerColumn: string[] = ['extra-header'];

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
    this.isInternalUser = this.employeeService.isInternalUser();
    if (this.isInternalUser)
      this.displayedColumns.splice(5, 0, "orgInfo");
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((_caseType: number) => {
        return this.service.getFollowupsByType('external');
      }))
      .pipe(
        //@BeSaRa - this antipattern , I made it for reason
        tap(() => this.commonService.loadCounters().subscribe())
      )
      .subscribe((list: Followup[]) => {
        this.models = list;
      });
  }

  terminate(model: Followup, $event?: MouseEvent) {
    $event?.preventDefault();
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

  rejectTerminate(model: Followup): void {
    model.rejectTerminate()
      .subscribe((comment) => {
        if (comment.length) {
          this.reload$.next(null)
          this.toast.success(this.lang.map.msg_reject_terminate_successfully)
        }
      })
  }

  showComments(model: Followup, _$event?: MouseEvent) {
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

  hasTerminatedRequest(row: Followup): boolean {
    return this.employeeService.isInternalUser() && row.status === FollowupStatusEnum.PARTIAL_TERMINATION
  }

  editDueDate(row: Followup): void {
    row.updateDueDate()
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        click === UserClickOn.YES && this.reload$.next(null)
      })
  }
}
