import { UserPreferencesService } from '@services/user-preferences.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QueryResultSet } from '@models/query-result-set';
import { LangService } from '@services/lang.service';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Team } from '@models/team';
import { EmployeeService } from '@services/employee.service';
import { BehaviorSubject, interval, Observable, of, Subject } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { QueryResult } from '@models/query-result';
import { InboxService } from '@services/inbox.service';
import { ToastService } from '@services/toast.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { WFResponseType } from '../enums/wfresponse-type.enum';
import { DialogRef } from '../shared/models/dialog-ref';
import { CaseModel } from '@models/case-model';
import { WFActions } from '../enums/wfactions.enum';
import { IESComponent } from '@contracts/iescomponent';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ITableOptions } from '@app/interfaces/i-table-options';
import { TableComponent } from '@app/shared/components/table/table.component';
import { FilterEventTypes } from '@app/types/types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IPartialRequestCriteria } from '@app/interfaces/i-partial-request-criteria';
import { IInboxCriteria } from '@app/interfaces/i-inbox-criteria';
import { CommonUtils } from '@app/helpers/common-utils';
import { SortEvent } from '@app/interfaces/sort-event';
import { CaseTypes } from '@app/enums/case-types.enum';
import { Lookup } from "@app/models/lookup";
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { DateUtils } from '@app/helpers/date-utils';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { DialogService } from '@app/services/dialog.service';

@Component({
  selector: 'team-inbox',
  templateUrl: './team-inbox.component.html',
  styleUrls: ['./team-inbox.component.scss']
})
export class TeamInboxComponent implements OnInit, AfterViewInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  inboxChange$: BehaviorSubject<Team | null> = new BehaviorSubject<Team | null>(null);
  teams: Team[] = [];
  destroy$: Subject<any> = new Subject<any>();
  selectControl: UntypedFormControl = new UntypedFormControl();
  actions: IMenuItem<QueryResult>[] = [];

  @ViewChild('table') table!: TableComponent;
  filterCriteria: Partial<IInboxCriteria> = {};

  headerColumn: string[] = ['extra-header'];

  oldQueryResultSet?: QueryResultSet;

  gridActions: IMenuItem<QueryResult>[] = [];

  constructor(public lang: LangService,
    private toast: ToastService,
    private router: Router,
    private inboxService: InboxService,
    private commonService: CommonService,
    public employeeService: EmployeeService,
    private globalSettingsService: GlobalSettingsService,
    private userPreferencesService:UserPreferencesService,
    private dialog:DialogService
    ) {
    if (this.employeeService.isExternalUser()) {
      this.tableOptions.columns = this.tableOptions.columns.filter(x => x !== 'orgInfo');
    }
  }

  tableOptions: ITableOptions = {
    ready: false,
    columns: ['workItemStatus', 'BD_FULL_SERIAL', 'BD_SUBJECT', 'BD_CASE_TYPE', 'action',  'PI_CREATE','ACTIVATED', 'PI_DUE','fromUserInfo','team','actions'],//'BD_SUBJECT', 'orgInfo'
    searchText: '',
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    },
    searchCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    filterCallback: (type: FilterEventTypes = 'OPEN') => {
      if (type === 'CLEAR') {
        this.filterCriteria = {};
        this.reloadSelectedInbox();
      } else if (type === 'OPEN') {
        const sub = this.inboxService.openFilterTeamInboxDialog(this.filterCriteria)
          .subscribe((dialog: DialogRef) => {
            dialog.onAfterClose$.subscribe((result: UserClickOn | Partial<IPartialRequestCriteria>) => {
              if (!CommonUtils.isValidValue(result) || result === UserClickOn.CLOSE) {
                return;
              }
              this.filterCriteria = result as Partial<IInboxCriteria>;
              this.reloadSelectedInbox();
              sub.unsubscribe();
            });
          });
      }
    },
    sortingCallbacks: {
      displayNameInfo: (a: QueryResult, b: QueryResult, dir: SortEvent) => {
        const value1 = !CommonUtils.isValidValue(a) ? '' : a.displayNameInfo?.getName().toLowerCase();
        const value2 = !CommonUtils.isValidValue(b) ? '' : b.displayNameInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.tableOptions.ready = true;
    });
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
    let data;
    if (!this.hasFilterCriteria()) {
      data = this.inboxService.loadTeamInbox(this.inboxChange$.value?.id!);
    } else {
      data = this.inboxService.loadTeamInbox(this.inboxChange$.value?.id!, this.filterCriteria);
    }
    return data
      .pipe(tap(() => this.commonService.loadCounters().subscribe()))
      // .pipe(tap(val => console.log(val.items)))
      .pipe(tap(result => {
        this.queryResultSet = result;
        this.oldQueryResultSet = { ...result };
        this.table && this.table.clearSelection();
      }));
  }

  ngOnInit(): void {
    this.reloadDefaultTeam();
    this.selectControl.patchValue(this.inboxChange$.value);
    this.listenToInboxChange();
    this.listenToSelectControl();
    this.buildGridActions();
    this.setRefreshInterval();
    this.validateOutOfOffice();
  }

  setRefreshInterval() {
    interval(DateUtils.getMillisecondsFromMinutes(this.globalSettingsService.getGlobalSettings().inboxRefreshInterval))
      .pipe(takeUntil(this.destroy$))
      .subscribe(()=>this.inboxChange$.next(this.inboxChange$.value));
  }

  reloadDefaultTeam(): void {
    this.inboxChange$.next(this.employeeService.teams[0] || null);
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
      .subscribe((value: Team) => {
        this.inboxChange$.next(value);
      });
  }

  reloadSelectedInbox() {
    this.inboxChange$.next(this.inboxChange$.value);
  }

  actionClaim(item: QueryResult, dialogRef?: DialogRef, loadedModel?: CaseModel<any, any>, component?: IESComponent<CaseModel<any, any>>, caseViewerComponent?: any) {
    item.claim()
      .pipe(take(1))
      .subscribe((val) => {
        this.reloadSelectedInbox();
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }

        this.toast.success(this.lang.map.task_have_been_claimed_successfully);
        // remove claim action from the actions to hide claim Action from the viewer.
        loadedModel && loadedModel.taskDetails.actions.splice(loadedModel.taskDetails.actions.indexOf(WFActions.ACTION_CLAIM), 1);
        // push the cancel claim action to the actions array to display the RELEASE ACTION.
        loadedModel && loadedModel.taskDetails.actions.push(WFActions.ACTION_CANCEL_CLAIM);
        component && this.employeeService.isInternalUser() && (component.allowEditRecommendations = true);
        if (component && component.handleReadonly && typeof component?.handleReadonly === 'function') {
          component.handleReadonly();
        }
        caseViewerComponent && caseViewerComponent.checkForFinalApproveByMatrixNotification();
      });
  }

  actionMarkAsRead(item: QueryResult, viewDialogRef?: DialogRef) {
    item.markAsRead()
      .subscribe((val) => {
        this.reloadSelectedInbox();
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.msg_mark_as_read_success);
        viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      });
  }

  actionMarkAsUnread(item: QueryResult, viewDialogRef?: DialogRef) {
    item.markAsUnread()
      .subscribe((val) => {
        this.reloadSelectedInbox();
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.msg_mark_as_unread_success);
        viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      });
  }

  actionRelease(item: QueryResult, viewDialogRef?: DialogRef) {
    item.release()
      .subscribe((val) => {
        this.reloadSelectedInbox();
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.task_have_been_released_successfully);
        viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      });
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  /*actionManageRecommendations(item: QueryResult) {
    item.manageRecommendations().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }*/

  actionManageComments(item: QueryResult) {
    item.manageComments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToUser(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToUser().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToStructureExpert(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToStructureExpert().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToDevelopmentExpert(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDevelopmentExpert().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDepartment().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToSingleDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToSingleDepartment().onAfterClose$.subscribe((_) => {
      viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      this.reloadSelectedInbox();
    });
  }

  actionSendToMultiDepartments(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToMultiDepartments().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionComplete(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.complete().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.approve().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionFinalApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.finalApprove().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionAskForConsultation(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.askForConsultation().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionPostpone(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.postpone().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionClose(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.close().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionReject(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.reject().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionReturn(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.return().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
    });
  }

  actionOpen(item: QueryResult) {
    /*item.open(this.actions, OpenFrom.TEAM_INBOX)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => this.reloadSelectedInbox());*/
    this.router.navigate([item.itemRoute], { queryParams: { item: item.itemDetails } }).then();
  }

  actionClaimBeforeOpen(item: QueryResult) {
    /*item.claim()
      .pipe(switchMap(_ => {
        return item.open(this.actions, OpenFrom.TEAM_INBOX).pipe(switchMap(ref => ref.onAfterClose$));
      }))
      .subscribe(() => this.reloadSelectedInbox());*/
    item.claim().subscribe(() => {
      this.actionOpen(item);
    })
  }

  openTask(item: QueryResult): void {
    (this.inboxChange$.value && this.inboxChange$.value?.autoClaim) ? this.actionClaimBeforeOpen(item) : this.actionOpen(item);
  }

  actionSendToManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToGeneralManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToGeneralManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  private buildGridActions() {
    this.actions = [
      // open
      {
        type: 'action',
        icon: 'mdi-eye',
        label: 'open_task',
        data: { hideFromViewer: true },
        hideLabel: true,
        displayInGrid: false,
        onClick: (item: QueryResult) => this.openTask(item)
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        hideLabel: true,
        displayInGrid: true,
        onClick: (item: QueryResult) => this.actionViewLogs(item)
      },
      // manage attachments
      {
        type: 'action',
        icon: 'mdi-paperclip',
        label: 'manage_attachments',
        data: { hideFromViewer: true },
        /*show: (item: QueryResult) => {
          let caseStatus = item.getCaseStatus();
          return (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      /*{
        type: 'action',
        icon: 'mdi-star-settings',
        label: 'manage_recommendations',
        data: {
          hideFromViewer: true,
          hideFromContext: true
        },
        show: () => this.employeeService.isInternalUser(),
        onClick: (item: QueryResult) => {
          this.actionManageRecommendations(item);
        }
      },*/
      // manage comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        data: { hideFromViewer: true },
        show: (item: QueryResult) => {
          return this.employeeService.isInternalUser() && item.getCaseStatus() !== CommonCaseStatus.CANCELLED;
        },
        onClick: (item: QueryResult) => {
          this.actionManageComments(item);
        }
      },
      // claim
      {
        type: 'action',
        icon: 'mdi-hand-back-right',
        label: 'claim',
        hideLabel: true,
        displayInGrid: true,
        data: {
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return loadedModel.taskDetails.actions && loadedModel.taskDetails.actions.indexOf(WFActions.ACTION_CLAIM) === -1;
          }
        },
        onClick: (item: QueryResult, dialogRef?: DialogRef, loadedModel?: CaseModel<any, any>, component?: IESComponent<CaseModel<any, any>>, caseViewerComponent?: any) => {
          this.actionClaim(item, dialogRef, loadedModel, component, caseViewerComponent);
        }
      },
      // Release
      {
        type: 'action',
        icon: 'mdi-hand-okay',
        label: 'release_task',
        data: {
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return loadedModel.taskDetails.actions && !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          },
          hideFromContext: true,
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => this.actionRelease(item, viewDialogRef)
      },
      { type: 'divider' },
      // send to department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_COMPETENT_DEPARTMENT) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToDepartment(item, viewDialogRef);
        }
      },
      // send to multi department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_multi_departments',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS)
            || item.RESPONSES.includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToMultiDepartments(item, viewDialogRef);
        }
      },
      // send to single department (Supervision and control, risk and compliance)
      // {
      //   type: 'action',
      //   icon: 'mdi-send-circle',
      //   label: (item: QueryResult) => {
      //     let isSendToRiskAndCompliance: boolean = (item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT));

      //     return isSendToRiskAndCompliance ? this.lang.map.send_to_risk_and_compliance_department : this.lang.map.send_to_supervision_and_control_department;
      //   },
      //   data: {
      //     hideFromContext: true,
      //     hideFromViewer: (loadedModel: CaseModel<any, any>) => {
      //       return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
      //     }
      //   },
      //   /*show: (item: QueryResult) => {
      //     return item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
      //       || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT);
      //   },*/
      //   show: (item: QueryResult) => false,
      //   onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
      //     this.actionSendToSingleDepartment(item, viewDialogRef);
      //   }
      // },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_USER) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToUser(item, viewDialogRef);
        }
      },
      // send to structural expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_structure_expert',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.TO_CONSTRUCTION_EXPERT);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToStructureExpert(item, viewDialogRef);
        }
      },
      // send to developmental expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_development_expert',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.TO_DEVELOPMENT_EXPERT);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToDevelopmentExpert(item, viewDialogRef);
        }
      },
      // send to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_MANAGER) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToManager(item, viewDialogRef);
        }
      },
      // send to general Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_general_manager',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.SEND_TO_GM) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToGeneralManager(item, viewDialogRef);
        }
      },
      { type: 'divider' },
      // complete
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }

        },
        /*show: (item: QueryResult) => {
          return !item.RESPONSES.length || item.RESPONSES.includes(WFResponseType.COMPLETE);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionComplete(item, viewDialogRef);
        }
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.APPROVE);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionApprove(item, viewDialogRef);
        }
      },
      // final approve
      {
        type: 'action',
        icon: 'mdi-check-underline',
        label: (item) => item.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE ? this.lang.map.final_approve_task_based_on_matrix : this.lang.map.final_approve_task,
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.FINAL_APPROVE);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionFinalApprove(item, viewDialogRef);
        }
      },
      // ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionAskForConsultation(item, viewDialogRef);
        }
      },
      // postpone
      {
        type: 'action',
        icon: 'mdi-calendar-clock',
        label: 'postpone_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.POSTPONE);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionPostpone(item, viewDialogRef);
        }
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.RETURN) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReturn(item, viewDialogRef);
        }
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.REJECT) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReject(item, viewDialogRef);
        }
      },
      // close/cancel task
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'cancel_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM);
          }
        },
        /*show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.CLOSE) !== -1;
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionClose(item, viewDialogRef);
        }
      },
      // mark as read
      {
        type: 'action',
        icon: ActionIconsEnum.OPEN_MAIL,
        label: 'mark_as_read',
        displayInGrid: false,
        data: { hideFromViewer: true },
        show: (item: QueryResult) => !item.isRead(),
        onClick: (item: QueryResult) => this.actionMarkAsRead(item)
      },
      // mark as unread
      {
        type: 'action',
        icon: ActionIconsEnum.CLOSE_MAIL,
        label: 'mark_as_unread',
        displayInGrid: false,
        show: (item: QueryResult) => item.isRead(),
        onClick: (item: QueryResult) => this.actionMarkAsUnread(item)
      },
    ];
    this.gridActions = this.actions.filter(action => action.displayInGrid)
  }

  displayStepName(row: QueryResult) {
    return this.lang.map[row.TAD_DISPLAY_NAME];
  }

  getServiceName(service: number) {
    let serviceKey: keyof ILanguageKeys;
    try {
      serviceKey = this.inboxService.getService(service).serviceKey;
    } catch (e) {
      return '';
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }

  hasFilterCriteria(): boolean {
    return !CommonUtils.isEmptyObject(this.filterCriteria) && CommonUtils.objectHasValue(this.filterCriteria);
  }

  onInboxFiltered($event: Lookup | undefined): void {
    if ($event) {
      this.queryResultSet!.items = this.oldQueryResultSet!.items.filter((item) => item.riskStatusInfo.lookupKey === $event.lookupKey)
    } else {
      this.queryResultSet!.items = this.oldQueryResultSet!.items
    }
  }
  validateOutOfOffice(){
    this.userPreferencesService.validateOutOfOffice()
    .pipe(
      take(1),
      tap(result=>{
        debugger;
        if(result){
          this.dialog.alert(this.lang.map.msg_user_oof_mode)
        }
      })
    )
    .subscribe()
  }
}
