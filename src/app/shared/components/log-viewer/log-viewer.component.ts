import {AssignedTask} from '@models/assigned-task';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActionLogService} from '@app/services/action-log.service';
import {BehaviorSubject, iif, merge, of, Subject} from 'rxjs';
import {ActionRegistry} from '@app/models/action-registry';
import {concatMap, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {LangService} from '@app/services/lang.service';
import {TabComponent} from '../tab/tab.component';
import {CaseTypes} from '@app/enums/case-types.enum';
import { BlobModel } from '@app/models/blob-model';

@Component({
  selector: 'log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit, OnDestroy {
  constructor(public lang: LangService) {
  }

  @Output() onLoadDone: EventEmitter<ActionRegistry[]> = new EventEmitter<ActionRegistry[]>();

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
  };

  get caseType(): CaseTypes | undefined {
    return this._caseType;
  }

  logsAll: ActionRegistry[] = [];
  logsHistory: ActionRegistry[] = [];
  logsOthers: ActionRegistry[] = [];

  displayedColumns: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];
  displayedColumnsHistory: string[] = ['user', 'action', 'addedOn', 'time', 'comment'];
  displayedColumnsOthers: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];

  locations: AssignedTask[] = [];
  displayPrintBtn: boolean = true;
  destroy$: Subject<any> = new Subject<any>();

  ngOnInit(): void {
    this.load();
  }

  tabChanged($event: TabComponent) {
    this.displayPrintBtn = $event.name !== 'itemLocation';
  }

  load(): void {
    merge(of(this.caseId), this._caseId, this.reload$)
      .pipe(filter(() => !!this.caseId))
      .pipe(map(_ => this.caseId))
      .pipe(switchMap(id => this.service.load(id)))
      .pipe(
        takeUntil(this.destroy$),
        tap(logs => this.onLoadDone.emit(logs)),
        tap(logs => this._categorizeLogsByActionType(logs)),
        concatMap(() => iif(() => this.hideItemLocation, of([]), this.service.loadCaseLocation(this.caseId!)))
      )
      .subscribe(locations => this.locations = locations);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _categorizeLogsByActionType(logs: ActionRegistry[]) {
    this.logsAll = [];
    this.logsHistory = [];
    this.logsOthers = [];

    if (!this.categorizeLogs) {
      this.logsAll = !this.hideViewedAction ? logs : logs.filter(log => !log.isViewedAction());
    } else {
      logs.forEach((log) => {
        if (log.isUpdatedAction()) {
          this.logsHistory = this.logsHistory.concat(log);
        } else if (log.isViewedAction()) {
          if (!this.hideViewedAction) {
            this.logsHistory = this.logsHistory.concat(log);
          }
        } else {
          this.logsOthers = this.logsOthers.concat(log);
        }
      });
    }
  }
  printLogs() {
    this.service.exportActions(this.caseId).pipe(take(1)).subscribe((blob: BlobModel) => window.open(blob.url));
  }
}
