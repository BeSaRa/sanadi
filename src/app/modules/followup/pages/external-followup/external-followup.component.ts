import { Component } from '@angular/core';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { FollowupService } from '@app/services/followup.service';
import { Followup } from '@app/models/followup';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { Subject } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { FollowupStatusEnum } from '@app/enums/status.enum';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';
import { EmployeeService } from '@app/services/employee.service';
import { SortEvent } from "@contracts/sort-event";
import { CommonUtils } from "@helpers/common-utils";

@Component({
  selector: 'external-followup',
  templateUrl: './external-followup.component.html',
  styleUrls: ['./external-followup.component.scss']
})
export class ExternalFollowupComponent extends AdminGenericComponent<Followup, FollowupService> {
  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['caseId', 'name', 'serviceType', 'dueDate', 'status', 'actions'];
  searchText = '';
  add$: Subject<any> = new Subject<any>();
  isInternalUser!: boolean;
  headerColumn: string[] = ['extra-header'];

  sortCallbacks = {
    name: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.getName(), b.getName(), d.direction);
    },
    service: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.serviceInfo.getName(), b.serviceInfo.getName(), d.direction);
    },
    organization: (a: Followup, b: Followup, d: SortEvent): number => {
      return CommonUtils.getSortValue(a.orgInfo.getName(), b.orgInfo.getName(), d.direction);
    },
  }

  constructor(public service: FollowupService,
              public lang: LangService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
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

  get statusEnum() {
    return FollowupStatusEnum;
  }

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
