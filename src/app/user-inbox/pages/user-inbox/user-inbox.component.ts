import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {InboxService} from '@app/services/inbox.service';
import {QueryResultSet} from '@app/models/query-result-set';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {QueryResult} from '@app/models/query-result';
import {BehaviorSubject, Subject} from 'rxjs';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OpenFrom} from '@app/enums/open-from.enum';
import {FormControl} from '@angular/forms';
import {EmployeeService} from '@app/services/employee.service';
import {CaseModel} from '@app/models/case-model';
import {WFActions} from '@app/enums/wfactions.enum';
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

@Component({
  selector: 'app-user-inbox',
  templateUrl: './user-inbox.component.html',
  styleUrls: ['./user-inbox.component.scss']
})
export class UserInboxComponent implements OnInit, OnDestroy {
  queryResultSet?: QueryResultSet;
  displayedColumns: string[] = ['BD_FULL_SERIAL', 'BD_CASE_TYPE', 'ACTIVATED', 'action', 'PI_CREATE', 'PI_DUE', 'fromUserInfo'];
  reloadInbox$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private destroy$: Subject<any> = new Subject<any>();
  actions: IMenuItem<QueryResult>[] = [];
  filterControl: FormControl = new FormControl('');

  constructor(public lang: LangService,
              private toast: ToastService,
              private employeeService: EmployeeService,
              private inboxService: InboxService) {

  }


  private listenToReload() {
    this.reloadInbox$
      .pipe(
        switchMap(_ => this.inboxService.loadUserInbox()),
        takeUntil(this.destroy$),
        tap(items => console.log(items))
      )
      .subscribe((value) => {
        this.queryResultSet = value;
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.listenToReload();
    this.buildGridActions();
  }

  actionManageAttachments(item: QueryResult) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionManageRecommendations(item: QueryResult) {
    item.manageRecommendations().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionManageComments(item: QueryResult) {
    item.manageComments().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionViewLogs(item: QueryResult) {
    item.viewLogs().onAfterClose$.subscribe(() => this.reloadInbox$.next(null));
  }

  actionSendToUser(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToUser().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionSendToDepartment(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.sendToDepartment().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionComplete(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.complete().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.approve().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionFinalApprove(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.finalApprove().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionAskForConsultation(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.askForConsultation().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionPostpone(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.postpone().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionClose(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.close().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionReject(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.reject().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }

  actionReturn(item: QueryResult, viewDialogRef?: DialogRef): void {
    item.return().onAfterClose$.subscribe(actionTaken => {
      actionTaken ? viewDialogRef?.close() : null;
      this.reloadInbox$.next(null);
    });
  }


  actionOpen(item: QueryResult) {
    item.open(this.actions, OpenFrom.USER_INBOX)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => this.reloadInbox$.next(null));
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
        viewDialogRef?.close();
      });
  }

  actionSendToManager(item: QueryResult, viewDialogRef?: DialogRef) {
    item.sendToManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken ? viewDialogRef?.close() : null;
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
        data: {hideFromViewer: true},
        onClick: (item: QueryResult) => this.actionOpen(item)
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
        data: {hideFromViewer: true},
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
      {type: 'divider'},
      // send to department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.TO_COMPETENT_DEPARTMENT);
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.TO_USER);
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.FINAL_APPROVE);
        },
        onClick: (item: QueryResult, viewDialogRef?: DialogRef) => {
          this.actionFinalApprove(item, viewDialogRef);
        }
      },
      // ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.RETURN);
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.REJECT);
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.CLOSE);
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
        show: (item: QueryResult) => {
          return item.RESPONSES.includes(WFResponseType.TO_MANAGER);
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
      console.log(service);
      return "";
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }
}
