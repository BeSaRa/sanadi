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
import { ToastService } from '@app/services/toast.service';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { SearchColumnConfigMap } from '@app/interfaces/i-search-column-config';
import { CustomValidators } from '@app/validators/custom-validators';
import { LookupService } from '@app/services/lookup.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent extends AdminGenericComponent<Team, TeamService> {
  usePagination = true;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'authName', 'updatedOn', 'status','email', 'actions'];
  searchColumns: string[] = ['_', 'search_arName', 'search_enName', 'search_authName','search_updatedOn', 'search_status', 'search_actions'];
  searchColumnsConfig: SearchColumnConfigMap = {
    search_arName: {
      key: 'arName',
      controlType: 'text',
      property: 'arName',
      label: 'arabic_name',
      maxLength: CustomValidators.defaultLengths.ARABIC_NAME_MAX
    },
    search_enName: {
      key: 'enName',
      controlType: 'text',
      property: 'enName',
      label: 'english_name',
      maxLength: CustomValidators.defaultLengths.ENGLISH_NAME_MAX
    },
    search_authName: {
      key:'authName',
      controlType:'text',
      property:'authName',
      label:'code',
      maxLength:CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
    },
    search_status: {
      key: 'status',
      controlType: 'select',
      property: 'status',
      label: 'lbl_status',
      selectOptions: {
        options: this.lookupService.listByCategory.CommonStatus.filter(status => !status.isRetiredCommonStatus()),
        labelProperty: 'getName',
        optionValueKey: 'lookupKey'
      }
    }
  }

  teams: Team[] = [];
  actions: IMenuItem<Team>[] = [];
  bulkActions: IGridAction[] = [];

  @ViewChild('table') table!: TableComponent;

  constructor(public langService: LangService,
              public service: TeamService,
              private toast: ToastService,
              private lookupService:LookupService,
              private fb:FormBuilder) {
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
    this.buildFilterForm()
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
      },
      // logs
      {
        type: 'action',
        icon: ActionIconsEnum.HISTORY,
        label: 'show_logs',
        onClick: (item: Team) => this.showAuditLogs(item)
      },
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [];
  }

  buildFilterForm() {
    this.columnFilterForm = this.fb.group({
      arName: [''], enName: [''], authName: [''], status: [null]
    })
  }
}
