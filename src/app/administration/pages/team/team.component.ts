import { Component, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeamService } from '@app/services/team.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Team } from '@app/models/team';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { SortEvent } from '@app/interfaces/sort-event';
import { isValidValue } from '@app/helpers/utils';
import { CommonUtils } from '@app/helpers/common-utils';
import { TableComponent } from '@app/shared/components/table/table.component';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { ToastService } from '@app/services/toast.service';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent extends AdminGenericComponent<Team, TeamService> {
  prepareFilterModel(): Partial<Team> {
    throw new Error('Method not implemented.');
  }
  usePagination = true;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'authName', 'updatedOn', 'status', 'actions'];
  teams: Team[] = [];
  actions: IMenuItem<Team>[] = [];
  bulkActions: IGridAction[] = [];
  commonStatus = CommonStatusEnum;

  @ViewChild('table') table!: TableComponent;

  reload$ = new BehaviorSubject<any>(null);

  constructor(public langService: LangService,
              public service: TeamService,
              private toast: ToastService) {
    super();
  }

  sortingCallbacks = {
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
  };

  protected _init(): void {
    this.buildActions();
    this.buildBulkActions();
  }

  afterReload(): void {
    this.table && this.table.clearSelection();
  }

  viewTeam(team: Team): void {
    this.service.openViewDialog(team)
      .pipe(takeUntil(this.destroy$)).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe();
    });
  }

  private buildActions() {
    this.actions = [
      // edit
      {
        type: 'action',
        icon: ActionIconsEnum.EDIT,
        label: 'btn_edit',
        onClick: (item: Team) => this.edit$.next(item),
        show: () => true
      },
      // view
      {
        type: 'action',
        icon: ActionIconsEnum.VIEW,
        label: 'view',
        onClick: (item: Team) => this.viewTeam(item),
        show: () => true
      }
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [];
  }
}
