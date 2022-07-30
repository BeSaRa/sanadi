import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { TeamService } from '@app/services/team.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Team } from '@app/models/team';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SortEvent } from '@app/interfaces/sort-event';
import { isValidValue } from '@app/helpers/utils';
import { CommonUtils } from '@app/helpers/common-utils';
import { TableComponent } from '@app/shared/components/table/table.component';
import { ITableOptions } from '@app/interfaces/i-table-options';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { FilterEventTypes } from '@app/types/types';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ToastService } from '@app/services/toast.service';
import { AdminGenericComponent } from "@app/generics/admin-generic-component";

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent extends AdminGenericComponent<Team, TeamService> implements AfterViewInit {
  usePagination = true;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'authName', 'updatedOn', 'status', 'actions'];
  teams: Team[] = [];
  actions: IMenuItem<Team>[] = [];
  bulkActions: IGridAction[] = [];
  commonStatus = CommonStatusEnum;

  @ViewChild('table') table!: TableComponent;

  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(public langService: LangService,
              public service: TeamService,
              private toast: ToastService) {
    super()
  }

  tableOptions: ITableOptions = {
    ready: false,
    searchText: '',
    columns: this.displayedColumns,
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    },
    searchCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    filterCallback: (_type: FilterEventTypes = 'OPEN') => {
    },
    sortingCallbacks: {
      createdBy: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.createdByInfo.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.createdByInfo.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      updatedBy: (a: Team, b: Team, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.updatedByInfo.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.updatedByInfo.getName().toLowerCase();
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
        let value1 = !isValidValue(a) ? '' : a.statusInfo.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.statusInfo.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  // ngOnInit(): void {
  //   // this.listenToReload();
  //   // this.listenToAdd();
  //   this.buildActions();
  //   this.buildBulkActions();
  // }

  protected _init(): void {
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
        return this.service.loadComposite();
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
    const sub = this.service.openCreateDialog().subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  editTeam(team: Team): void {
    const sub = this.service.openUpdateDialog(team.id, false).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  viewTeam(team: Team): void {
    const sub = this.service.openUpdateDialog(team.id, true).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
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
          return true;
        }
      },
      // view
      {
        type: 'action',
        icon: 'mdi-eye',
        label: 'view',
        onClick: (item: Team) => this.viewTeam(item),
        show: () => {
          return true;
        }
      },
      // activate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_activate',
        onClick: (item: Team) => this.toggleStatus(item),
        show: (item) => {
          return item.status === CommonStatusEnum.DEACTIVATED;
        }
      },
      // deactivate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_deactivate',
        onClick: (item: Team) => this.toggleStatus(item),
        show: (item) => {
          return item.status === CommonStatusEnum.ACTIVATED;
        }
      }
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [];
  }

  toggleStatus(team: Team) {
    this.service.updateStatus(team.id, team.status)
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({ x: team.getName() }));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({ x: team.getName() }));
        this.reload$.next(null);
      });
  }
}
