import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {TeamService} from '../../../services/team.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {Team} from '../../../models/team';
import {IMenuItem} from '../../../modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '../../../interfaces/sort-event';
import {isValidValue} from '../../../helpers/utils';
import {CommonUtils} from '../../../helpers/common-utils';
import {TableComponent} from '../../../shared/components/table/table.component';
import {ITableOptions} from '../../../interfaces/i-table-options';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit, AfterViewInit {
  teams: Team[] = [];
  actions: IMenuItem[] = [];
  bulkActions: IGridAction[] = [];

  @ViewChild('table') table!: TableComponent;

  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(public langService: LangService,
              private teamService: TeamService) {
  }

  tableOptions: ITableOptions = {
    ready: false,
    columns: ['select', 'arName', 'enName', 'authName', 'createdOn', 'createdBy', 'updatedOn', 'updatedBy', 'status', 'actions'],
    searchText: '',
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    },
    filterCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    sortingCallbacks: {
      createdBy: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      updatedBy: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      createdOn: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : new Date(a.createdOn).valueOf(),
          value2 = !isValidValue(b) ? '' : new Date(b.createdOn).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      updatedOn: (a: Team, b: Team, dir: SortEvent): number => {
        // @ts-ignore
        let value1 = !isValidValue(a) ? '' : new Date(a.updatedOn).valueOf(),
          // @ts-ignore
          value2 = !isValidValue(b) ? '' : new Date(b.updatedOn).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      statusInfo: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.buildActions();
    this.buildBulkActions();
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.tableOptions.ready = true;
    });
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.teamService.loadComposite();
      })
    ).subscribe((teams) => {
      this.teams = teams;
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }


  add(): void {
    const sub = this.teamService.openCreateDialog().subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  editTeam(team: Team): void {
    const sub = this.teamService.openUpdateDialog(team.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  private buildActions() {
    this.actions = [
      // edit
      {
        type: 'action',
        icon: 'mdi-pen',
        label: 'btn_edit',
        onClick: (item: Team) => this.editTeam(item),
        show: () => {
          return true
        }
      }
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [];
  }
}
