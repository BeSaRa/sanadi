import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {QueryResultSet} from '../models/query-result-set';
import {LangService} from '../services/lang.service';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {SortEvent} from '../interfaces/sort-event';
import {PageEvent} from '../interfaces/page-event';
import {TeamInboxService} from '../services/team-inbox.service';
import {Team} from '../models/team';
import {EmployeeService} from '../services/employee.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {TableComponent} from '../shared/components/table/table.component';
import {EServiceListService} from '../services/e-service-list.service';

@Component({
  selector: 'team-inbox',
  templateUrl: './team-inbox.component.html',
  styleUrls: ['./team-inbox.component.scss']
})
export class TeamInboxComponent implements OnInit, OnDestroy, AfterViewInit {
  queryResultSet?: QueryResultSet;
  inboxChange$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'BD_CASE_TYPE', 'PI_CREATE', 'PI_DUE', 'actions'];
  searchModel = '';
  teams: Team[] = [];
  destroy$: Subject<any> = new Subject<any>();
  selectControl: FormControl = new FormControl();
  @ViewChild(TableComponent)
  table!: TableComponent;

  constructor(public lang: LangService,
              private service: TeamInboxService,
              public eService: EServiceListService,
              public employee: EmployeeService) {
  }

  ngAfterViewInit(): void {
    console.log('    this.table;', this.table);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasSelectedInbox(): boolean {
    return !!this.inboxChange$.value;
  }

  loadSelectedTeamInbox(): Observable<null | QueryResultSet> {
    if (!this.hasSelectedInbox()) {
      return of(null);
    }
    return this.service.load(this.inboxChange$.value!)
      .pipe(tap(val => console.log(val.items)))
      .pipe(tap(result => this.queryResultSet = result));
  }

  ngOnInit(): void {
    this.reloadDepartmentInboxOfFirstTeam();
    this.selectControl.patchValue(this.inboxChange$.value);
    this.listenToInboxChange();
    this.listenToSelectControl();
  }

  reloadDepartmentInboxOfFirstTeam(): void {
    this.inboxChange$.next(this.employee.getInternalDepartment()?.mainTeam.id || this.employee.teams[0].id || null);
  }

  sortBy($event: SortEvent) {
    console.log($event);
  }

  search($event: Event) {
    let input = $event.target as HTMLInputElement;
    this.searchModel = input.value;
  }

  log($event: PageEvent) {
    console.log($event);
  }

  private listenToInboxChange() {
    this.inboxChange$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.loadSelectedTeamInbox();
        })
      ).subscribe();
  }

  private listenToSelectControl() {
    this.selectControl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.inboxChange$.next(value);
      });
  }

  reloadSelectedInbox() {
    this.inboxChange$.next(this.inboxChange$.value);
  }

  sortDate(a: string, b: string): number {
    console.log(a, b);
    return 1;
  }
}
