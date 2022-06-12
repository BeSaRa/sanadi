import { Component } from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {Followup} from '@app/models/followup';
import {FollowupService} from '@app/services/followup.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {Subject} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {EmployeeService} from '@app/services/employee.service';
import {ToastService} from '@app/services/toast.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {FollowupStatusEnum} from '@app/enums/status.enum';

@Component({
  selector: 'internal-followup',
  templateUrl: './internal-followup.component.html',
  styleUrls: ['./internal-followup.component.scss']
})
export class InternalFollowupComponent extends AdminGenericComponent<Followup, FollowupService> {

  actions: IMenuItem<Followup>[] = [];
  displayedColumns: string[] = ['requestNumber', 'name', 'serviceType', 'dueDate', 'status', 'orgInfo', 'actions'];
  searchText = '';
  add$: Subject<any> = new Subject<any>();

  constructor(public service: FollowupService,
              public lang: LangService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
              private toast: ToastService) {
    super();
  }

  _init() {
    this.reload$.next(1);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((caseType: number) => {
        return this.service.getFollowupsByType('internal');
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
        const sub = this.service.terminate(model.id).subscribe(result => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_success_terminate_followup);
          this.reload$.next(1);
          sub.unsubscribe();
        });
      }
    });

  }

  showComments(model: Followup, $event: MouseEvent) {
    this.dialog.show(this.service._getCommentsDialogComponent(), model);
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  get statusEnum(){
    return FollowupStatusEnum;
  }

  getDateColor(dueDate: any): 'red' |'blue' | 'green'{
    dueDate = (new Date(dueDate.split('T')[0]).setHours(0,0,0,0));
    let currentDate = (new Date().setHours(0,0,0,0));

    if(dueDate < currentDate)
      return 'red';
    else if(dueDate > currentDate)
      return 'green';
    else
      return 'blue'
  }
}
