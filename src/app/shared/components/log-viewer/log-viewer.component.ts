import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActionLogService} from '../../../services/action-log.service';
import {Subject} from 'rxjs';
import {ActionRegistry} from '../../../models/action-registry';
import {concatMap, takeUntil, tap} from 'rxjs/operators';
import {LangService} from '../../../services/lang.service';
import {AdminResult} from '../../../models/admin-result';

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

  @Input()
  service!: ActionLogService<any>;

  displayedColumns: string[] = ['user', 'action', 'addedOn', 'time','comment'];
  displayLocationColumns: string[] = ['location'];

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.load(this.caseId)
      .pipe(
        takeUntil(this.destroy$),
        tap(logs => this.logs = logs),
        concatMap(() => this.service.loadCaseLocation(this.caseId))
      )
      .subscribe(locations => this.locations = locations);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
