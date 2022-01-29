import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActionLogService} from '@app/services/action-log.service';
import {BehaviorSubject, iif, merge, of, Subject} from 'rxjs';
import {ActionRegistry} from '@app/models/action-registry';
import {concatMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {LangService} from '@app/services/lang.service';
import {AdminResult} from '@app/models/admin-result';
import {TabComponent} from '../tab/tab.component';
import {ServiceActionType} from '@app/enums/service-action-type.enum';

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
  destroy$: Subject<any> = new Subject<any>();

  constructor(public lang: LangService) {
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  tabChanged($event: TabComponent) {
    this.displayPrintBtn = $event.name !== 'location';
  }

  private _categorizeLogsByActionType(logs: any[]) {
    logs.forEach(x => {
      if (x.actionId === ServiceActionType.Viewed) {
        this.logsViewed = [].concat(x);
      } else if (x.actionId === ServiceActionType.Updated) {
        this.logsUpdated = [].concat(x);
      } else {
        this.logsOthers = [].concat(x);
      }
    });
  }
}
