import {Component, OnDestroy, OnInit} from '@angular/core';
import {QueryResultSet} from '../models/query-result-set';
import {LangService} from '../services/lang.service';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {Team} from '../models/team';
import {EmployeeService} from '../services/employee.service';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FormControl} from '@angular/forms';
import {QueryResult} from '../models/query-result';
import {InboxService} from '../services/inbox.service';
import {ToastService} from '../services/toast.service';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {WFResponseType} from '../enums/wfresponse-type.enum';
import {DialogRef} from '../shared/models/dialog-ref';
import {OpenFrom} from '../enums/open-from.enum';
import {CaseModel} from '../models/case-model';
import {WFActions} from '../enums/wfactions.enum';
import {IESComponent} from '../interfaces/iescomponent';
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

@Component({
  selector: 'team-inbox',
  templateUrl: './team-inbox.component.html',
  styleUrls: ['./team-inbox.component.scss']
})
export class TeamInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  inboxChange$: BehaviorSubject<Team | null> = new BehaviorSubject<Team | null>(null);
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'BD_CASE_TYPE', 'BD_SUBJECT', 'ACTIVATED', 'action', 'PI_CREATE', 'PI_DUE', 'fromUserInfo'];
  teams: Team[] = [];
  destroy$: Subject<any> = new Subject<any>();
  selectControl: FormControl = new FormControl();
  actions: IMenuItem<QueryResult>[] = [];

  filterControl: FormControl = new FormControl('');

  constructor(public lang: LangService,
              private toast: ToastService,
              private inboxService: InboxService,
              public employeeService: EmployeeService) {
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
    return this.inboxService.loadTeamInbox(this.inboxChange$.value?.id!)
      .pipe(tap(val => console.log(val.items)))
      .pipe(tap(result => this.queryResultSet = result));
  }

  ngOnInit(): void {
    this.reloadDefaultTeam();
    this.selectControl.patchValue(this.inboxChange$.value);
    this.listenToInboxChange();
    this.listenToSelectControl();
    this.buildGridActions();
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

  actionClaim(item: QueryResult, dialogRef?: DialogRef, loadedModel?: CaseModel<any, any>, component?: IESComponent) {
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
        viewDialogRef?.close();
      });
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionManageRecommendations(item: QueryResult) {
    item.manageRecommendations().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionManageComments(item: QueryResult) {
    item.manageComments().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadSelectedInbox());
  }

  actionSendToUser(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToUser().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionSendToDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDepartment().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadSelectedInbox();
    });
  }

  actionComplete(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.complete().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.approve().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionFinalApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.finalApprove().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionAskForConsultation(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.askForConsultation().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionPostpone(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.postpone().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionClose(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.close().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionReject(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.reject().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionReturn(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.return().onAfterClose$.subscribe(actionTaken => {
      this.reloadSelectedInbox();
      actionTaken ? viewDialogRef?.close() : null;
    });
  }

  actionOpen(item: QueryResult) {
    item.open(this.actions, OpenFrom.TEAM_INBOX)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => this.reloadSelectedInbox());
  }

  actionClaimBeforeOpen(item: QueryResult) {
    item.claim()
      .pipe(switchMap(_ => {
        return item.open(this.actions, OpenFrom.TEAM_INBOX).pipe(switchMap(ref => ref.onAfterClose$))
      }))
      .subscribe(() => this.reloadSelectedInbox());
  }

  openTask(item: QueryResult): void {
    (this.inboxChange$.value && this.inboxChange$.value?.autoClaim) ? this.actionClaimBeforeOpen(item) : this.actionOpen(item);
  }

  actionSendToManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef?.close() : null;
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
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => this.openTask(item)
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        onClick: (item: QueryResult) => this.actionViewLogs(item)
      },
      // manage attachments
      {
        type: 'action',
        icon: 'mdi-paperclip',
        label: 'manage_attachments',
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      {
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
      },
      // comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => {
          this.actionManageComments(item);
        }
      },
      // claim
      {
        type: 'action',
        icon: 'mdi-hand-right',
        label: 'claim',
        data: {
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return loadedModel.taskDetails.actions && loadedModel.taskDetails.actions.indexOf(WFActions.ACTION_CLAIM) === -1;
          }
        },
        onClick: (item: QueryResult, dialogRef?: DialogRef, loadedModel?: CaseModel<any, any>, component?: IESComponent) => {
          this.actionClaim(item, dialogRef, loadedModel, component);
        }
      },
      // Release
      {
        type: 'action',
        icon: 'mdi-hand-okay',
        label: 'release_task',
        data: {
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return loadedModel.taskDetails.actions && !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          },
          hideFromContext: true,
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => this.actionRelease(item, viewDialogRef)
      },
      // send to department
      {type: 'divider'},
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_COMPETENT_DEPARTMENT) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToDepartment(item, viewDialogRef);
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_USER) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToUser(item, viewDialogRef);
        }
      },
      // complete
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }

        },
        show: (item: QueryResult) => {
          return !item.RESPONSES.length || item.RESPONSES.includes(WFResponseType.COMPLETE);
        },
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
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.APPROVE);
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionApprove(item, viewDialogRef);
        }
      },
      // final approve
      {
        type: 'action',
        icon: 'mdi-check-underline',
        label: 'final_approve_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.FINAL_APPROVE);
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionFinalApprove(item, viewDialogRef);
        }
      },
      //ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
        },
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
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.POSTPONE);
        },
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
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.RETURN) !== -1;
        },
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
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.REJECT) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionReject(item, viewDialogRef);
        }
      },
      //close
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'close_task',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.CLOSE) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionClose(item, viewDialogRef);
        }
      },
      //to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        data: {
          hideFromContext: true,
          hideFromViewer: (loadedModel: CaseModel<any, any>) => {
            return !loadedModel.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM)
          }
        },
        show: (item: QueryResult) => {
          return item.RESPONSES.indexOf(WFResponseType.TO_MANAGER) !== -1;
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionSendToManager(item, viewDialogRef);
        }
      }
    ];
  }

  displayStepName(row: QueryResult) {
    return this.lang.map[row.TAD_DISPLAY_NAME];
  }

  getServiceName(service: number) {
    let serviceKey: keyof ILanguageKeys;
    try {
      serviceKey = this.inboxService.getService(service).serviceKey;
    } catch (e) {
      return "";
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }
}
