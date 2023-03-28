import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AssignedTask} from '@models/assigned-task';
import {LangService} from '@services/lang.service';
import {CaseTypes} from '@app/enums/case-types.enum';
import {IMenuItem} from '@modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {ServiceDataService} from '@services/service-data.service';
import {ServiceData} from '@models/service-data';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {ActionLogService} from '@services/action-log.service';

@Component({
  selector: 'service-log-item-location',
  templateUrl: './service-log-item-location.component.html',
  styleUrls: ['./service-log-item-location.component.scss']
})
export class ServiceLogItemLocationComponent {
  constructor(public lang: LangService,
              private serviceDataService: ServiceDataService,
              private dialog: DialogService,
              private toast: ToastService,
              private employeeService: EmployeeService) {
  }

  @Output() onReload: EventEmitter<any> = new EventEmitter();
  @Input() service!: ActionLogService;
  @Input() locationsList: AssignedTask[] = [];
  @Input() isMainDeptRequest: boolean = false;

  private _caseType?: CaseTypes;
  @Input() set caseType(value: CaseTypes | undefined) {
    this._caseType = value;
    if (value) {
      this._loadServiceDataByCaseType(value);
    }
  };

  get caseType(): CaseTypes | undefined {
    return this._caseType;
  }

  serviceData!: ServiceData;
  locationActions: IMenuItem<AssignedTask>[] = [
    // terminate task
    {
      label: 'terminate_task',
      type: 'action',
      icon: ActionIconsEnum.TERMINATE,
      show: (item) => this.isTerminateAllowed() && this.canTerminateTask(item),
      onClick: (item) => this.terminateTask(item)
    }
  ];

  reload(): void {
    this.onReload.emit(true);
  }

  private _displayedColumns = ['location','stepSubject'];

  get displayedColumns(): string[] {
    if (this.canTerminateAnyItemLocation()) {
      return this._displayedColumns.concat(['actions']);
    }
    return this._displayedColumns;
  };

  private isTerminateAllowed(): boolean {
    // should be internal user
    // case opened from main department
    return this.employeeService.isInternalUser() && this.isMainDeptRequest;
  }

  private canTerminateTask(item: AssignedTask): boolean {
    return !item.isMain && this.timeOut(item);
  }

  private canTerminateAnyItemLocation() {
    // location of item to be terminated should not be main department
    // time is already passed according to service data
    return this.isTerminateAllowed() && !!this.locationsList.find((item) => this.canTerminateTask(item));
  }

  private _loadServiceDataByCaseType(caseType: CaseTypes) {
    this.serviceDataService.loadByCaseType(caseType)
      .subscribe((result) => this.serviceData = result);
  }

  timeOut(task: AssignedTask) {
    if (!this.serviceData) {
      return false;
    }
    const timeZoneOffset = new Date().getTimezoneOffset();
    const ReviewLimitHours = (new Date(task.startDate).getTime() / 1000 - timeZoneOffset) / 60 / 60 + this.serviceData.serviceReviewLimit;
    const DateNowHours = new Date().getTime() / 1000 / 60 / 60;
    return ReviewLimitHours <= DateNowHours;
  }

  terminateTask(item: AssignedTask) {
    this.dialog.confirm(this.lang.map.msg_confirm_terminate_task).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          // @ts-ignore
          this.service.terminateTask(item.tkiid).subscribe(() => {
            this.toast.success(this.lang.map.msg_success_terminate_task);
            this.reload();
          });
        }
      });
  }
}
