import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicComponentService } from '@app/services/dynamic-component.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { EServiceGenericService } from '@app/generics/e-service-generic-service';
import { CaseModel } from '@app/models/case-model';
import { OpenFrom } from '@app/enums/open-from.enum';
import { IOpenedInfo } from '@app/interfaces/i-opened-info';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { WFActions } from '@app/enums/wfactions.enum';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ToastService } from '@app/services/toast.service';
import { InboxService } from '@app/services/inbox.service';
import { merge, Subject } from 'rxjs';
import { skip, startWith, takeUntil } from 'rxjs/operators';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { IESComponent } from '@app/interfaces/iescomponent';
import { OrgUser } from '@app/models/org-user';
import { InternalUser } from '@app/models/internal-user';
import { ChecklistItem } from '@app/models/checklist-item';
import { StepCheckListComponent } from '@app/shared/components/step-check-list/step-check-list.component';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'e-service-component-wrapper',
  templateUrl: './e-service-component-wrapper.component.html',
  styleUrls: ['./e-service-component-wrapper.component.scss']
})
export class EServiceComponentWrapperComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(private route: ActivatedRoute,
    private injector: Injector,
    private employeeService: EmployeeService,
    public lang: LangService,
    private router: Router,
    private toast: ToastService,
    private inboxService: InboxService,
    private cfr: ComponentFactoryResolver) {
    this.render = this.route.snapshot.data.render as string;
    if (!this.render) {
      throw Error(`Please Provide render property in this route ${route.snapshot.url}`);
    }
  }

  private userInboxActions: IMenuItem<CaseModel<any, any>>[] = [];
  private teamInboxActions: IMenuItem<CaseModel<any, any>>[] = [];
  private searchActions: IMenuItem<CaseModel<any, any>>[] = [];
  private addActions: IMenuItem<CaseModel<any, any>>[] = [];

  private readonly render: string;
  private componentRef!: ComponentRef<EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<any>>>;
  @ViewChild('internalContainer', { read: ViewContainerRef })
  internalContainer!: ViewContainerRef;

  @ViewChild('externalContainer', { read: ViewContainerRef })
  externalContainer!: ViewContainerRef;

  @ViewChild(StepCheckListComponent)
  checklistComponent!: StepCheckListComponent;

  actions: IMenuItem<CaseModel<any, any>>[] = [];
  service!: EServiceGenericService<CaseModel<any, any>>;
  model?: CaseModel<any, any>;
  component!: EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>;
  internal: boolean = this.employeeService.isInternalUser();
  info: IOpenedInfo | null = null;
  destroy$: Subject<any> = new Subject<any>();
  loadAttachments: boolean = false;

  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  actionIconsEnum = ActionIconsEnum;

  checklist: ChecklistItem[] = [];
  saveTypes: typeof SaveTypes = SaveTypes;
  excludedDraftTypes: number[] = [
    CaseTypes.INQUIRY,
    CaseTypes.CONSULTATION,
    CaseTypes.INTERNATIONAL_COOPERATION,
  ];
  internalUserServices: number[] = [
    CaseTypes.INQUIRY,
    CaseTypes.CONSULTATION,
    CaseTypes.INTERNATIONAL_COOPERATION,
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN
  ];

  finalApproveByMatrixServices: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.URGENT_INTERVENTION_LICENSING
  ];

  canShowMatrixNotification: boolean = false;
  matrixNotificationType!: 'success' | 'danger';
  matrixNotificationMsg!: string;

  ngOnDestroy(): void {
    this.destroy$.next('Destroy');
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.rebuildRouteStrategy();
    this.info = this.route.snapshot.data['info'] as (IOpenedInfo | null);
    const component = DynamicComponentService.getComponent(this.render);
    const componentFactory = this.cfr.resolveComponentFactory(component);
    this.componentRef = componentFactory.create(this.injector);
    this.component = this.componentRef.instance as EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>;

    this.service = this.component.service;
    this.component.accordionView = this.employeeService.isInternalUser();
    this.component.fromWrapperComponent = true;

    if (this.info && this.route.snapshot.queryParamMap.has('item')) {
      this.checklist = this.info.checklist;
      this.component.outModel = this.info.model;
      this.model = this.info.model;
      this.model.setInboxService(this.inboxService);
      this.component.openFrom = this.info.openFrom;
      this.component.operation = OperationTypes.UPDATE;
      this.component.fromDialog = true;
      if (this.info.openFrom === OpenFrom.SEARCH) {
        this.prepareFromSearch();
      } else {
        this.prepareFromInbox();
      }
    } else {
      this.model = new (this.service._getModel());
      this.model!.setInboxService(this.inboxService);
    }
    this.component.allowEditRecommendations = this.isAllowedToEditRecommendations(this.model!, this.info?.openFrom ? this.info.openFrom : OpenFrom.ADD_SCREEN);
    // listen to model change
    this.listenToModelChange();
    this.listenToAfterSave();
    // listen to change language
    this.listenToLangChange();
  }

  rebuildRouteStrategy() {
    const callback = this.router.routeReuseStrategy.shouldReuseRoute;
    const sub = merge(this.destroy$)
      .pipe(startWith('Start'))
      .subscribe((val: 'Start' | 'Destroy') => {
        val === 'Start' ? (this.router.routeReuseStrategy.shouldReuseRoute = () => false) : this.router.routeReuseStrategy.shouldReuseRoute = callback;
        val === 'Destroy' && sub.unsubscribe();
      });
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.internal ? this.internalContainer.clear() : this.externalContainer.clear();
      this.internal ? this.internalContainer.insert(this.componentRef.hostView) : this.externalContainer.insert(this.componentRef.hostView);
      this.displayRightActions(this.info?.openFrom ? (this.info.openFrom) : OpenFrom.ADD_SCREEN);
      this.checkForFinalApproveByMatrixNotification();
    });
  }

  checkForFinalApproveByMatrixNotification(): void {
    let canShowNotification: boolean = (!!this.model && this.finalApproveByMatrixServices.includes(this.model.getCaseType()))
      && (this.openFrom === OpenFrom.USER_INBOX || (this.openFrom === OpenFrom.TEAM_INBOX && this.model.taskDetails.isClaimed()))
      && (this.employeeService.isLicensingManager() || this.employeeService.isLicensingChiefManager());

    if (canShowNotification) {
      this.component.service.checkFinalApproveNotificationByMatrix(this.model!.id)
        .subscribe((result: boolean) => {
          this.canShowMatrixNotification = canShowNotification;
          this.matrixNotificationType = result ? 'success' : 'danger';
          if (this.employeeService.isLicensingManager()) {
            this.matrixNotificationMsg = result ? this.lang.map.based_on_matrix_should_not_send_to_general_manager : this.lang.map.based_on_matrix_should_send_to_general_manager;
            return;
          }
          this.matrixNotificationMsg = result ? this.lang.map.msg_success_final_approve_task_based_on_matrix_notification : this.lang.map.msg_fail_final_approve_task_based_on_matrix_notification;
        });
    }
  }

  private prepareFromInbox(): void {
    if (!this.info) {
      return;
    }

    if (!this.model) {
      return;
    }
    this.component.readonly = true;
  }

  private prepareFromSearch(): void {
    if (!this.info) {
      return;
    }

    if (!this.model) {
      return;
    }
    this.component.readonly = !(this.model!.canStart());
    this.component.allowEditRecommendations = (this.info.openFrom === OpenFrom.USER_INBOX || (this.info.openFrom === OpenFrom.SEARCH && this.model!.canStart())) && this.employeeService.isInternalUser();
  }

  private buildSearchActions(): void {
    this.searchActions = [
      // save
      {
        type: 'action',
        label: 'btn_save',
        disabled: (item) => this.component.form.invalid || item?.alreadyStarted(),
        show: (item) => {
          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        }
      },
      // launch
      {
        type: 'action',
        label: 'launch',
        show: (item: CaseModel<any, any>) => item.canStart(),
        onClick: (item: CaseModel<any, any>) => {
          this.launchAction(item);
        }
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !!this.model?.id,
        onClick: (item: CaseModel<any, any>) => {
          item.viewLogs();
        }
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: () => !this.internal,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print()
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom()
      }
    ];
  }

  private buildAddAction(): void {
    this.addActions = [
      // save
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'btn_save',
        disabled: (item) => {
          return this.component.form.invalid || item?.alreadyStarted();
        },
        show: (item) => {
          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        }
      },
      // launch
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'launch',
        disabled: (item) => !item?.canStart(),
        onClick: () => {
          this.component.launch();
        }
      },
      // save as draft
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'save_as_draft',
        show: () => {
          return (!!this.model && !this.excludedDraftTypes.includes(this.model.getCaseType()));
        },
        disabled: item => !item?.canDraft(),
        onClick: () => {
          this.component.save.next(this.saveTypes.DRAFT);
        }
      },
      // reset
      {
        class: 'btn-secondary',
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'btn_reset',
        show: () => (!this.model?.id),
        onClick: () => {
          this.component.resetForm$.next(null);
        }
      }
    ];
  }

  private launchAction(item: CaseModel<any, any>) {
    item.start()
      .subscribe(_ => {
        this.toast.success(this.lang.map.request_has_been_sent_successfully);
        this.navigateToSamePageThatUserCameFrom();
      });
  }

  private buildTeamInboxActions(): void {
    this.teamInboxActions = [
      // claim
      {
        type: 'action',
        icon: 'mdi-hand-back-right',
        label: 'claim',
        displayInGrid: true,
        onClick: (item: CaseModel<any, any>) => {
          this.claimAction(item);
        }
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !this.internal,
        onClick: (item: CaseModel<any, any>) => EServiceComponentWrapperComponent.viewLogsAction(item)
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: () => !this.internal,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print()
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom()
      }
    ];
  }

  private buildUserInboxActions(): void {
    this.userInboxActions = [
      // save
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'btn_save',
        disabled: () => this.component.readonly,
        show: (item) => {
          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        }
      },
      // release
      {
        type: 'action',
        icon: 'mdi-hand-okay',
        label: 'release_task',
        askChecklist: true,
        show: item => item.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM),
        onClick: (item: CaseModel<any, any>) => this.releaseAction(item)
      },
      // send to department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_COMPETENT_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToDepartmentAction(item);
        }
      },
      // send to specific organization
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'return_to_org_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN_TO_SPECIFIC_ORGANIZATION);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnToSpecificOrganizationAction(item);
        }
      },
      // send to multi department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_multi_departments',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToMultiDepartmentsAction(item);
        }
      },
      // send to specific department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_department',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_SINGLE_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToMultiDepartmentsAction(item);
        }
      },
      // send to single department (Supervision and control, risk and compliance)
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: (item: CaseModel<any, any>) => {
          let isSendToRiskAndCompliance: boolean = (item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT));

          return isSendToRiskAndCompliance ? this.lang.map.send_to_risk_and_compliance_department : this.lang.map.send_to_supervision_and_control_department;
        },
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
            || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToSingleDepartmentAction(item);
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_USER);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToUserAction(item);
        }
      },
      // send to structural expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_structure_expert',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_CONSTRUCTION_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToStructureExpertAction(item);
        }
      },
      // send to developmental expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_development_expert',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_DEVELOPMENT_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToDevelopmentExpertAction(item);
        }
      },
      // send to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_MANAGER);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToManagerAction(item);
        }
      },
      // send to general Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_general_manager',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_GM);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToGeneralManagerAction(item);
        }
      },
      // complete
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return !item.getResponses().length || item.getResponses().includes(WFResponseType.COMPLETE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.completeAction(item);
        }
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.approveAction(item);
        }
      },
      // initial approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'initial_approve_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INITIAL_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.initialApproveAction(item);
        }
      },
      // organization approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'org_approve_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationApproveAction(item);
        }
      },
      // validate approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'validate_approve_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.VALIDATE_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.validateApproveAction(item);
        }
      },
      // final approve
      {
        type: 'action',
        icon: 'mdi-check-underline',
        askChecklist: true,
        label: (item) => this.finalApproveByMatrixServices.includes(item.getCaseType()) ? this.lang.map.final_approve_task_based_on_matrix : this.lang.map.final_approve_task,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.FINAL_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalApproveAction(item);
        }
      },
      // final notification
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'final_Notification',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return !item.getResponses().length || item.getResponses().includes(WFResponseType.FINAL_NOTIFICATION);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalNotification(item);
        }
      },
      // ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.askForConsultationAction(item);
        }
      },
      // postpone
      {
        type: 'action',
        icon: 'mdi-calendar-clock',
        label: 'postpone_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.POSTPONE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.postponeAction(item);
        }
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnAction(item);
        }
      },
      // final reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'final_reject_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.FINAL_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalRejectAction(item);
        }
      },
      // organization reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'organization_reject_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationRejectAction(item);
        }
      },
      // validate reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'validate_reject_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.VALIDATE_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.validateRejectAction(item);
        }
      },
      // return to organization
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_to_org_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN_TO_ORG);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnToOrganizationAction(item);
        }
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.rejectAction(item);
        }
      },
      //close/cancel task
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'cancel_task',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.CLOSE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.closeAction(item);
        }
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !this.internal,
        onClick: (item: CaseModel<any, any>) => EServiceComponentWrapperComponent.viewLogsAction(item)
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: () => !this.internal,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print()
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom()
      }
    ];
  }

  private navigateToSamePageThatUserCameFrom(): void {
    if (this.info == null) {
      return;
    }
    switch (this.info.openFrom) {
      case OpenFrom.TEAM_INBOX:
        this.router.navigate(['/home/team-inbox']).then();
        break;
      case OpenFrom.USER_INBOX:
        this.router.navigate(['/home/user-inbox']).then();
        break;
      case OpenFrom.SEARCH: {
        this.router.navigate(['/home/services-search', this.route.snapshot.params]).then();
        break;
      }
    }

  }

  private displayRightActions(openFrom: OpenFrom) {
    if (!this.shouldFollowTheOpenFrom(openFrom)) {
      openFrom = this.getTheRightOpenForm();
    }
    this.openFrom = openFrom;
    switch (openFrom) {
      case OpenFrom.USER_INBOX:
        this.buildUserInboxActions();
        this.actions = this.actionShowFilter(this.userInboxActions);
        break;
      case OpenFrom.TEAM_INBOX:
        this.buildTeamInboxActions();
        this.actions = this.actionShowFilter(this.teamInboxActions);
        break;
      case OpenFrom.SEARCH:
        this.buildSearchActions();
        this.actions = this.actionShowFilter(this.searchActions);
        break;
      default:
        this.buildAddAction();
        this.actions = this.actionShowFilter(this.addActions);
    }
  }

  private shouldFollowTheOpenFrom(openFrom: OpenFrom): boolean {
    switch (openFrom) {
      case OpenFrom.USER_INBOX:
        return !!this.info && this.model!.openedFormInbox();
      case OpenFrom.TEAM_INBOX:
        return !!this.info && this.model!.openedFormTeamInbox();
      case OpenFrom.SEARCH:
        return !!this.info && this.model!.openedFromSearch();
      case OpenFrom.ADD_SCREEN:
        return true;
      default:
        return false;
    }
  }

  private actionShowFilter(actions: IMenuItem<CaseModel<any, any>>[]): IMenuItem<CaseModel<any, any>>[] {
    return actions.filter((action) => action.show && this.model ? action.show(this.model) : true);
  }

  private releaseAction(item: CaseModel<any, any>) {
    item.release().subscribe(() => {
      this.toast.success(this.lang.map.task_have_been_released_successfully);
      item.addReleaseAction();
      this.displayRightActions(OpenFrom.TEAM_INBOX); // update actions to be same as team inbox
      this.actions = this.translateActions(this.actions);
      this.component.readonly = true;
      this.component.allowEditRecommendations = false;
    });
  }

  private claimAction(item: CaseModel<any, any>) {
    item.claim().subscribe(() => {
      this.toast.success(this.lang.map.task_have_been_claimed_successfully);
      item.addClaimAction((this.employeeService.getCurrentUser() as (OrgUser | InternalUser)).getUniqueName());
      this.displayRightActions(OpenFrom.USER_INBOX);
      this.actions = this.translateActions(this.actions);
      this.component.allowEditRecommendations = this.internal;
      const component = (this.component as IESComponent<any>);
      if (component.handleReadonly && typeof component.handleReadonly === 'function') {
        component.handleReadonly();
      }
      this.checkForFinalApproveByMatrixNotification();
    });
  }

  private sendToDepartmentAction(item: CaseModel<any, any>) {
    item.sendToDepartment().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToMultiDepartmentsAction(item: CaseModel<any, any>) {
    item.sendToMultiDepartments().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToSingleDepartmentAction(item: CaseModel<any, any>) {
    item.sendToSingleDepartment().subscribe(() => {
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
      this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToUserAction(item: CaseModel<any, any>) {
    item.sendToUser().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToStructureExpertAction(item: CaseModel<any, any>) {
    item.sendToStructureExpert().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToDevelopmentExpertAction(item: CaseModel<any, any>): void {
    item.sendToDevelopmentExpert().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToManagerAction(item: CaseModel<any, any>) {
    item.sendToManager().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToGeneralManagerAction(item: CaseModel<any, any>) {
    item.sendToGeneralManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private finalNotification(item: CaseModel<any, any>) {
    item.finalNotification().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private completeAction(item: CaseModel<any, any>) {
    item.complete().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private approveAction(item: CaseModel<any, any>) {
    item.approve().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private initialApproveAction(item: CaseModel<any, any>) {
    item.initialApprove().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private organizationApproveAction(item: CaseModel<any, any>) {
    item.organizationApprove({
      form: this.component.form,
      organizationOfficers: (this.component as any).selectedOrganizationOfficers
    }).onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private validateApproveAction(item: CaseModel<any, any>) {
    item.validateApprove().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private finalApproveAction(item: CaseModel<any, any>) {
    item.finalApprove().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private askForConsultationAction(item: CaseModel<any, any>) {
    item.askForConsultation().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private postponeAction(item: CaseModel<any, any>) {
    item.postpone().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private returnAction(item: CaseModel<any, any>) {
    item.return().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private finalRejectAction(item: CaseModel<any, any>) {
    item.finalReject().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private organizationRejectAction(item: CaseModel<any, any>) {
    item.organizationReject().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private validateRejectAction(item: CaseModel<any, any>) {
    item.validateReject().onAfterClose$.subscribe(hasNoMoreOrganizations => {
      hasNoMoreOrganizations && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private returnToOrganizationAction(item: CaseModel<any, any>) {
    item.returnToOrganization().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private returnToSpecificOrganizationAction(item: CaseModel<any, any>) {
    item.returnToSpecificOrganization().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private rejectAction(item: CaseModel<any, any>) {
    item.reject().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private closeAction(item: CaseModel<any, any>) {
    item.close().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private static viewLogsAction(item: CaseModel<any, any>) {
    item.viewLogs();
  }

  private listenToLangChange(): void {
    this.lang
      .onLanguageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.actions = this.translateActions(this.actions);
      });
  }

  private updateActions(model: CaseModel<any, any>): void {
    this.model = model;
    this.model.setInboxService(this.inboxService);
    this.displayRightActions(this.info?.openFrom || OpenFrom.ADD_SCREEN);
    this.translateActions(this.actions);
  }

  private listenToModelChange(): void {
    this.component.onModelChange$
      .pipe(skip(1))
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this.updateActions(model!);
      });
  }


  private listenToAfterSave() {
    this.component!.afterSave$
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        if (this.info && (this.info.openFrom === OpenFrom.USER_INBOX || this.info.openFrom === OpenFrom.TEAM_INBOX)) {
          model = model.clone({
            taskDetails: this.model?.taskDetails
          });
        }
        this.updateActions(model);
      });
  }

  private translateActions(actions: IMenuItem<CaseModel<any, any>>[]): IMenuItem<CaseModel<any, any>>[] {
    return actions.map((action) => {
      action.translatedLabel = (typeof action.label === 'function' && this.model) ? action.label(this.model) : this.lang.map[action.label as keyof ILanguageKeys];
      return action;
    });
  }


  isAllowedToEditRecommendations(model: CaseModel<any, any>, from: OpenFrom): boolean {
    return this.employeeService.isInternalUser() && (from === OpenFrom.USER_INBOX || (from === OpenFrom.SEARCH && model.canStart()) || (model.taskDetails && model.taskDetails.actions && model.taskDetails.actions.indexOf(WFActions.ACTION_CANCEL_CLAIM) !== -1));
  }

  isAttachmentReadonly(): boolean {
    if (!this.component.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.component.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.component.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.component.model.getCaseStatus();
      isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }

    return !isAllowed;
  }

  print() {
    this.model?.exportModel().subscribe((blob) => window.open(blob.url));
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === 'attachments';
  }

  isDisabled(action: IMenuItem<CaseModel<any, any>>): boolean {
    return !!(this.model && (typeof action.disabled === 'function' ? action.disabled(this.model!) : action.disabled));
  }

  actionCallback(action: IMenuItem<CaseModel<any, any>>) {
    action.onClick && this.model && (!action.disabled || (typeof action.disabled === 'function' && !action.disabled(this.model))) && this.checkIfChecklistMarked(action, () => {
      return this.model && action.onClick && action.onClick(this.model);
    });
  }

  checkIfChecklistMarked(action: IMenuItem<CaseModel<any, any>>, callback: () => void): void {
    action.askChecklist && this.checklist.length && this.checklistComponent ? this.runActionAfterCheck(callback) : callback();
  }

  private runActionAfterCheck(callback: () => void) {
    this.isValidCheckList() ? callback() : this.checklistComponent.openSlide(callback);
  }

  private isValidCheckList(): boolean {
    return this.checklistComponent.isAllMarked();
  }

  private getTheRightOpenForm(): OpenFrom {
    if (!!this.info) {
      if (this.model?.openedFromSearch()) {
        return OpenFrom.SEARCH;
      } else if (this.model?.openedFormTeamInbox()) {
        return OpenFrom.TEAM_INBOX;
      } else if (this.model?.openedFormInbox()) {
        return OpenFrom.USER_INBOX;
      }
    }
    return OpenFrom.ADD_SCREEN;
  }

  isOpenedFromInbox(): boolean {
    return this.openFrom === OpenFrom.USER_INBOX;
  }
}
