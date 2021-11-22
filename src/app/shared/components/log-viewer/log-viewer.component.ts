import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActionLogService} from '@app/services/action-log.service';
import {iif, of, Subject} from 'rxjs';
import {ActionRegistry} from '@app/models/action-registry';
import {concatMap, takeUntil, tap} from 'rxjs/operators';
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
  logs: ActionRegistry[] = [];
  locations: AdminResult[] = [];
  destroy$: Subject<any> = new Subject<any>();

  @Input()
  caseId: string = '';

  @Input() hideViewedAction: boolean = false;
  @Input() hideItemLocation: boolean = false;

  @Input()
  service!: ActionLogService;

  displayedColumns: string[] = ['user', 'action', 'toUser', 'addedOn', 'time', 'comment'];
  displayLocationColumns: string[] = ['location'];

  displayPrintBtn: boolean = true;

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.load(this.caseId)
      .pipe(
        takeUntil(this.destroy$),
        tap(logs => {
          if (this.hideViewedAction) {
            logs = logs.filter(x => x.actionId !== ServiceActionType.Viewed);
          }
          this.logs = logs;
        }),
        concatMap(() => iif(()=> this.hideItemLocation, of([]), this.service.loadCaseLocation(this.caseId)))
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
}
