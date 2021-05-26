import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActionLogService} from '../../../services/action-log.service';
import {Subject} from 'rxjs';
import {ActionRegistry} from '../../../models/action-registry';
import {takeUntil, tap} from 'rxjs/operators';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit, OnDestroy {
  logs: ActionRegistry[] = [];
  destroy$: Subject<any> = new Subject<any>();

  @Input()
  caseId: string = '';

  @Input()
  service!: ActionLogService<any>;

  displayedColumns: string[] = ['user','action','addedOn','time'];

  constructor(public lang: LangService) {

  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.load(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(items => console.log(items)))
      .subscribe(logs => this.logs = logs);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
