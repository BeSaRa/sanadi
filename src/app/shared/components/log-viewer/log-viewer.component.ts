import { ServiceData } from '@app/models/service-data';
import { ServiceDataService } from '@app/services/service-data.service';
import { CaseModel } from '@app/models/case-model';
import { UserClickOn } from './../../../enums/user-click-on.enum';
import { DialogService } from './../../../services/dialog.service';
import { ToastService } from './../../../services/toast.service';
import { TaskDetails } from './../../../models/task-details';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActionLogService } from '@app/services/action-log.service';
import { BehaviorSubject, iif, merge, of, Subject } from 'rxjs';
import { ActionRegistry } from '@app/models/action-registry';
import { concatMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LangService } from '@app/services/lang.service';
import { AdminResult } from '@app/models/admin-result';
import { TabComponent } from '../tab/tab.component';
import { ServiceActionType } from '@app/enums/service-action-type.enum';
import { CaseTypes } from '@app/enums/case-types.enum';

@Component({
  selector: 'log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit, OnDestroy {
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
  @Input() case!: CaseModel<any, any> | undefined;

  logsAll: ActionRegistry[] = [];
  logsViewed: ActionRegistry[] = [];
  logsUpdated: ActionRegistry[] = [];
  logsOthers: ActionRegistry[] = [];

  displayedColumns: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];
  displayedColumnsViewed: string[] = ['user', 'addedOn', 'time', 'comment'];
  displayedColumnsUpdated: string[] = ['user', 'addedOn', 'time', 'comment'];
  displayedColumnsOthers: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];

  locations: AdminResult[] = [];
  displayLocationColumns: string[] = ['location'];

  displayPrintBtn: boolean = true;
  displayReturnBtn: boolean = false;
  destroy$: Subject<any> = new Subject<any>();
  _serviceData!: ServiceData;
  constructor(public lang: LangService,
    public toast: ToastService,
    private serviceData: ServiceDataService,
    public dialog: DialogService) {
  }

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
    this.case && this.serviceData.loadByCaseType(this.case.caseType).subscribe((service: ServiceData) => {
      this._serviceData = service;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  tabChanged($event: TabComponent) {
    this.displayPrintBtn = $event.name !== 'location';
    this.displayReturnBtn = $event.name === 'location' && (
      (this.case?.caseType == CaseTypes.NPO_MANAGEMENT ||
        this.case?.caseType == CaseTypes.CHARITY_ORGANIZATION_UPDATE) && !this.timeOut()
    );
  }
  timeOut() {
    // TODO: complete after descus
    return this._serviceData.serviceReviewLimit;
  }
  isMainTask(tkiid: string) {
    return this.case?.taskDetails.isMain && this.case?.taskDetails.tkiid == tkiid;
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
  terminate(tkiid: string) {
    this.dialog.confirm(this.lang.map.msg_confirm_terminate_task).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this.service.terminateTask(tkiid).subscribe(() => {
            this.toast.success(this.lang.map.msg_success_terminate_task);
            this.load();
          });
        }
      });
  }
}
