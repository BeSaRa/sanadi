import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { InboxService } from '@app/services/inbox.service';
import { QueryResultSet } from '@app/models/query-result-set';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { QueryResult } from '@app/models/query-result';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { EmployeeService } from '@app/services/employee.service';
import { CaseModel } from '@app/models/case-model';
import { WFActions } from '@app/enums/wfactions.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ITableOptions } from '@app/interfaces/i-table-options';
import { FilterEventTypes } from '@app/types/types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { IPartialRequestCriteria } from '@app/interfaces/i-partial-request-criteria';
import { CommonUtils } from '@app/helpers/common-utils';
import { IInboxCriteria } from '@app/interfaces/i-inbox-criteria';
import { TableComponent } from '@app/shared/components/table/table.component';
import { SortEvent } from '@app/interfaces/sort-event';
import { CaseTypes } from '@app/enums/case-types.enum';
import { Lookup } from '@app/models/lookup';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { DateUtils } from '@app/helpers/date-utils';

@Component({
  selector: 'app-user-inbox',
  templateUrl: './user-inbox.component.html',
  styleUrls: ['./user-inbox.component.scss']
})
export class UserInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  reloadInbox$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private destroy$: Subject<any> = new Subject<any>();
  actions: IMenuItem<QueryResult>[] = [];
  //filterControl: FormControl = new FormControl('');
  @ViewChild('table') table!: TableComponent;
  filterCriteria: Partial<IInboxCriteria> = {};

  tableOptions: ITableOptions = {
    ready: false,
    // columns: ['workItemStatus', 'BD_FULL_SERIAL', 'BD_CASE_TYPE', 'ACTIVATED', 'action', 'PI_CREATE', 'PI_DUE', 'BD_SUBJECT', 'fromUserInfo', 'actions'], //'BD_SUBJECT', 'orgInfo',
    columns: ['workItemStatus', 'BD_FULL_SERIAL', 'BD_SUBJECT', 'BD_CASE_TYPE', 'action', 'PI_CREATE', 'ACTIVATED', 'PI_DUE', 'fromUserInfo', 'actions'],//'BD_SUBJECT', 'orgInfo'
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
        this.reloadInbox$.next(null);
      } else if (type === 'OPEN') {
        const sub = this.inboxService.openFilterTeamInboxDialog(this.filterCriteria)
          .subscribe((dialog: DialogRef) => {
            dialog.onAfterClose$.subscribe((result: UserClickOn | Partial<IPartialRequestCriteria>) => {
              if (!CommonUtils.isValidValue(result) || result === UserClickOn.CLOSE) {
                return;
              }
              this.filterCriteria = result as Partial<IInboxCriteria>;
              this.reloadInbox$.next(null);
              sub.unsubscribe();
            });
          });
      }
    },
    sortingCallbacks: {
      displayNameInfo: (a: QueryResult, b: QueryResult, dir: SortEvent) => {
        let value1 = !CommonUtils.isValidValue(a) ? '' : a.displayNameInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.displayNameInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  headerColumn: string[] = ['extra-header'];

  oldQueryResultSet?: QueryResultSet;

  gridActions: IMenuItem<QueryResult>[] = [];

  constructor(public lang: LangService,
    private toast: ToastService,
    private router: Router,
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private inboxService: InboxService,
    private globalSettingsService: GlobalSettingsService) {
    if (this.employeeService.isExternalUser()) {
      this.tableOptions.columns = this.tableOptions.columns.filter(x => x !== 'orgInfo');
    }
  }


  private listenToReload() {
    this.reloadInbox$
      .pipe(
        switchMap(_ => {
          if (!this.hasFilterCriteria()) {
            return this.inboxService.loadUserInbox();
          } else {
            return this.inboxService.loadUserInbox(this.filterCriteria);
          }
        }
        ),
        takeUntil(this.destroy$),
        //@BeSaRa - this antipattern , I made it for reason
        tap(() => this.commonService.loadCounters().subscribe())
      )
      .subscribe((value) => {
        this.queryResultSet = value;
        this.oldQueryResultSet = { ...value };
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.listenToReload();
    this.buildGridActions();
    this.setRefreshInterval();
  }

  setRefreshInterval() {
    interval(DateUtils.getMillisecondsFromMinutes(this.globalSettingsService.getGlobalSettings().inboxRefreshInterval))
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.reloadInbox$);
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  /*actionManageRecommendations(item: QueryResult) {
   item.manageRecommendations().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
   }*/

  actionManageComments(item: QueryResult) {
    item.manageComments().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionSendToUser(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToUser().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToStructureExpert(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToStructureExpert().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToDevelopmentExpert(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDevelopmentExpert().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDepartment().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToMultiDepartments(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToMultiDepartments().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToSingleDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToSingleDepartment().subscribe((_) => {
      viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      this.reloadInbox$.next(null);
    });
  }

  actionComplete(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.complete().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.approve().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionFinalApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.finalApprove().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionAskForConsultation(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.askForConsultation().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionPostpone(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.postpone().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionClose(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.close().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionReject(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.reject().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionReturn(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.return().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }


  actionOpen(item: QueryResult) {
    /*item.open(this.actions, OpenFrom.USER_INBOX)
     .pipe(switchMap(ref => ref.onAfterClose$))
     .subscribe(() => this.reloadInbox$.next(null));*/
    this.router.navigate([item.itemRoute], { queryParams: { item: item.itemDetails } }).then();
  }

  actionRelease(item: QueryResult, viewDialogRef?: DialogRef) {
    item.release()
      .subscribe((val) => {
        this.reloadInbox$.next(null);
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.task_have_been_released_successfully);
        viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      });
  }

  actionMarkAsRead(item: QueryResult, viewDialogRef?: DialogRef) {
    item.markAsRead()
      .subscribe((val) => {
        this.reloadInbox$.next(null);
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
        this.reloadInbox$.next(null);
        if (val.failedOperations && val.failedOperations.length) {
          this.toast.error(this.lang.map.something_went_wrong_while_taking_action);
          return;
        }
        this.toast.success(this.lang.map.msg_mark_as_unread_success);
        viewDialogRef && viewDialogRef.close && viewDialogRef?.close();
      });
  }

  actionSendToManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToGeneralManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToGeneralManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef && viewDialogRef.close && viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
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
        onClick: (item: QueryResult) => this.actionOpen(item)
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
      // reassigned
      {
        type: 'action',
        label: 'reassigned_task',
        icon: ActionIconsEnum.REASSIGNED,
        show: (item: QueryResult) => item.BD_IS_REASSIGNED,
        hideLabel: true,
        displayInGrid: true,

      },
      // mark as read
      {
        type: 'action',
        icon: ActionIconsEnum.OPEN_MAIL,
        label: 'mark_as_read',
        data: { hideFromViewer: true },
        show: (item: QueryResult) => !item.isRead(),
        onClick: (item: QueryResult) => this.actionMarkAsRead(item)
      },
      // mark as unread
      {
        type: 'action',
        icon: ActionIconsEnum.CLOSE_MAIL,
        label: 'mark_as_unread',
        show: (item: QueryResult) => item.isRead(),
        onClick: (item: QueryResult) => this.actionMarkAsUnread(item)
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
       data: {hideFromViewer: true},
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.TO_COMPETENT_DEPARTMENT);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToMultiDepartments(item, viewDialogRef);
        }
      },
      // send to single department (Supervision and control, risk and compliance)
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: (item: QueryResult) => {
          let isSendToRiskAndCompliance: boolean = (item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT));

          return isSendToRiskAndCompliance ? this.lang.map.send_to_risk_and_compliance_department : this.lang.map.send_to_supervision_and_control_department;
        },
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToSingleDepartment(item, viewDialogRef);
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.TO_USER);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.TO_CONSTRUCTION_EXPERT);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.TO_DEVELOPMENT_EXPERT);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.TO_MANAGER);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.SEND_TO_GM);
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
        /*show: (item: QueryResult) => {
          return !item.getResponses().length || item.getResponses().includes(WFResponseType.COMPLETE);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.APPROVE);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.FINAL_APPROVE);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.POSTPONE);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.RETURN);
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
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.REJECT);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReject(item, viewDialogRef);
        }
      },
      //close/cancel task
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'cancel_task',
        /*show: (item: QueryResult) => {
          return item.getResponses().includes(WFResponseType.CLOSE);
        },*/
        show: (item: QueryResult) => false,
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionClose(item, viewDialogRef);
        }
      }
    ];
    this.gridActions = this.actions.filter(action => action.displayInGrid);
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
      this.queryResultSet!.items = this.oldQueryResultSet!.items.filter((item) => item.riskStatusInfo.lookupKey === $event.lookupKey);
    } else {
      this.queryResultSet!.items = this.oldQueryResultSet!.items;
    }
  }
}
