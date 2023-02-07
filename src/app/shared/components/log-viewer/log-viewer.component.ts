import {AssignedTask} from '@models/assigned-task';
import {ServiceData} from '@app/models/service-data';
import {ServiceDataService} from '@app/services/service-data.service';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActionLogService} from '@app/services/action-log.service';
import {BehaviorSubject, iif, merge, of, Subject} from 'rxjs';
import {ActionRegistry} from '@app/models/action-registry';
import {concatMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {LangService} from '@app/services/lang.service';
import {TabComponent} from '../tab/tab.component';
import {ServiceActionType} from '@app/enums/service-action-type.enum';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {InboxService} from '@services/inbox.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {EmployeeService} from '@services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit, OnDestroy {
  constructor(public lang: LangService,
              private employeeService: EmployeeService,
              private dialog: DialogService,
              private inboxService: InboxService,
              private serviceData: ServiceDataService,
              private toast: ToastService) {
  }

  reload$: Subject<void> = new Subject<void>();
  _caseId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  @Input()
  set caseId(value: string | undefined) {
    this._caseId.next(value ? value : '');
  };

  get caseId(): string {
    return this._caseId.value;
  }

  @Input() service!: ActionLogService;

  @Input() hideViewedAction: boolean = false;
  @Input() hideItemLocation: boolean = false;
  @Input() categorizeLogs: boolean = false;
  @Input() displayCategorizedAs: 'tabs' | 'one-page' = 'tabs';
  @Input() accordionView: boolean = false;

  private _isMainDeptRequest: boolean = false;
  @Input()
  set isMainDeptRequest(value: boolean) {
    this._isMainDeptRequest = value;
  };

  get isMainDeptRequest(): boolean {
    return this._isMainDeptRequest;
  };

  private _caseType?: CaseTypes;
  @Input()
  set caseType(value: CaseTypes | undefined) {
    this._caseType = value;
    if (value) {
      this._loadServiceDataByCaseType(value);
    }
  };

  get caseType(): CaseTypes | undefined {
    return this._caseType;
  }

  logsAll: ActionRegistry[] = [];
  logsViewed: ActionRegistry[] = [];
  logsUpdated: ActionRegistry[] = [];
  logsOthers: ActionRegistry[] = [];

  displayedColumns: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];
  displayedColumnsViewed: string[] = ['user', 'addedOn', 'time', 'comment'];
  displayedColumnsUpdated: string[] = ['user', 'addedOn', 'time', 'comment'];
  displayedColumnsOthers: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];

  locations: AssignedTask[] = [];
  private _displayLocationColumns = ['location'];
  get displayLocationColumns(): string[] {
    if (this.canTerminateAnyItemLocation()) {
      return this._displayLocationColumns.concat(['actions']);
    }
    return this._displayLocationColumns;
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
    return this.isTerminateAllowed() && !!this.locations.find((item) => this.canTerminateTask(item));
  }

  private _loadServiceDataByCaseType(caseType: CaseTypes) {
    this.serviceData.loadByCaseType(caseType)
      .subscribe((result) => this._serviceData = result);
  }

  displayPrintBtn: boolean = true;
  destroy$: Subject<any> = new Subject<any>();
  _serviceData!: ServiceData;

  actionIconsEnum = ActionIconsEnum;
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

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    merge(of(this.caseId), this._caseId, this.reload$)
      .pipe(filter(() => !!this.caseId))
      .pipe(map(_ => this.caseId))
      .pipe(switchMap(id => this.service.load(id)))
      .pipe(
        takeUntil(this.destroy$),
        tap(logs => {
          if (this.hideViewedAction) {
            logs = logs.filter(x => x.actionId !== ServiceActionType.Viewed);
          }
          if (this.categorizeLogs) {
            this._categorizeLogsByActionType(logs);
          }
          this.logsAll = logs;
        }),
        concatMap(() => iif(() => this.hideItemLocation, of([]), this.service.loadCaseLocation(this.caseId!)))
      )
      .subscribe(locations => this.locations = locations);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  tabChanged($event: TabComponent) {
    this.displayPrintBtn = $event.name !== 'location';
  }

  timeOut(task: AssignedTask) {
    if (!this._serviceData) {
      return false;
    }
    const timeZoneOffset = new Date().getTimezoneOffset();
    const ReviewLimitHours = (new Date(task.startDate).getTime() / 1000 - timeZoneOffset) / 60 / 60 + this._serviceData.serviceReviewLimit;
    const DateNowHours = new Date().getTime() / 1000 / 60 / 60;
    return ReviewLimitHours <= DateNowHours;
  }

  private _categorizeLogsByActionType(logs: any[]) {
    this.logsViewed = [];
    this.logsUpdated = [];
    this.logsOthers = [];
    logs.forEach(x => {
      if (x.actionId === ServiceActionType.Viewed) {
        this.logsViewed = this.logsViewed.concat(x);
      } else if (x.actionId === ServiceActionType.Updated) {
        this.logsUpdated = this.logsUpdated.concat(x);
      } else {
        this.logsOthers = this.logsOthers.concat(x);
      }
    });
  }

  terminateTask(item: AssignedTask) {
    this.dialog.confirm(this.lang.map.msg_confirm_terminate_task).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          // @ts-ignore
          this.service.terminateTask(item.tkiid).subscribe(() => {
            this.toast.success(this.lang.map.msg_success_terminate_task);
            this.load();
          });
        }
      });
  }
}
