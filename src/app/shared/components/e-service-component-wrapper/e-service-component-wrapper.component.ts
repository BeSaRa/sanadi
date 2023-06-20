import {GeneralAssociationMeetingAttendance} from '@models/general-association-meeting-attendance';
import {
  AwarenessActivitySuggestionComponent
} from '@modules/services/awareness-activity-suggestion/pages/awareness-activity-suggestion/awareness-activity-suggestion.component';
import {AwarenessActivitySuggestion} from '@models/awareness-activity-suggestion';
import {CoordinationWithOrganizationsRequest} from '@app/models/coordination-with-organizations-request';
import {
  IGeneralAssociationMeetingAttendanceSpecialActions
} from '@contracts/i-general-association-meeting-attendance-special-actions';
import {IGeneralAssociationMeetingAttendanceApprove} from '@contracts/i-general-association-meeting-attendance-approve';
import {
  IGeneralAssociationMeetingAttendanceComponent
} from '@contracts/i-general-association-meeting-attendance-component';
import {
  IGeneralAssociationMeetingAttendanceComplete
} from '@contracts/i-general-association-meeting-attendance-complete';
import {ITransferIndividualFundsAbroadComplete} from '@contracts/i-transfer-individual-funds-abroad-complete';

import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DynamicComponentService} from '@app/services/dynamic-component.service';
import {EmployeeService} from '@app/services/employee.service';
import {LangService} from '@app/services/lang.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {CaseModel} from '@app/models/case-model';
import {OpenFrom} from '@app/enums/open-from.enum';
import {IOpenedInfo} from '@app/interfaces/i-opened-info';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {WFActions} from '@app/enums/wfactions.enum';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ToastService} from '@app/services/toast.service';
import {InboxService} from '@app/services/inbox.service';
import {isObservable, merge, Observable, of, Subject} from 'rxjs';
import {filter, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {IESComponent} from '@app/interfaces/iescomponent';
import {ExternalUser} from '@app/models/external-user';
import {InternalUser} from '@app/models/internal-user';
import {ChecklistItem} from '@app/models/checklist-item';
import {StepCheckListComponent} from '@app/shared/components/step-check-list/step-check-list.component';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {
  IGeneralAssociationMeetingAttendanceFinalApprove
} from '@contracts/i-general-association-meeting-attendance-final-approve';
import {ProjectImplementation} from '@models/project-implementation';
import {WrapperButtonsGroupEnum} from '@enums/wrapper-buttons-group-enum';
import {UrgentInterventionLicenseFollowup} from '@models/urgent-intervention-license-followup';
import {
  TransferringIndividualFundsAbroadComponent
} from "@modules/services/transferring-individual-funds-abroad/pages/transferring-individual-funds-abroad/transferring-individual-funds-abroad.component";
import {ActionRegistry} from "@models/action-registry";
import { OrganizationOfficer } from '@app/models/organization-officer';

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
              private appRef: ApplicationRef,
              private inboxService: InboxService) {
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
  private componentRef!: ComponentRef<EServicesGenericComponent<CaseModel<any, any>, BaseGenericEService<any>>>;
  @ViewChild('internalContainer', {read: ViewContainerRef})
  internalContainer!: ViewContainerRef;

  @ViewChild('externalContainer', {read: ViewContainerRef})
  externalContainer!: ViewContainerRef;

  @ViewChild(StepCheckListComponent)
  checklistComponent!: StepCheckListComponent;

  actions: IMenuItem<CaseModel<any, any>>[] = [];
  service!: BaseGenericEService<CaseModel<any, any>>;
  model?: CaseModel<any, any>;
  component!: EServicesGenericComponent<CaseModel<any, any>, BaseGenericEService<CaseModel<any, any>>>;
  internal: boolean = this.employeeService.isInternalUser();
  info: IOpenedInfo | null = null;
  destroy$: Subject<any> = new Subject<any>();
  loadAttachments: boolean = false;
  allLogs: ActionRegistry[] = [];

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
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN,
    CaseTypes.FOREIGN_COUNTRIES_PROJECTS,
    CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST,
    CaseTypes.NPO_MANAGEMENT,
    CaseTypes.CHARITY_ORGANIZATION_UPDATE,
    CaseTypes.FOREIGN_COUNTRIES_PROJECTS
  ];
  servicesWithNoSaveDraftLaunch: number[] = [
    CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP
  ];

  completeWithSaveServices: number[] = [
    CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
    CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE
  ];

  completeWithSaveStatuses: number[] = [
    CommonCaseStatus.RETURNED,
    CommonCaseStatus.UNDER_PROCESSING
  ];

  approveWithSaveServices: number[] = [
    CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
    CaseTypes.AWARENESS_ACTIVITY_SUGGESTION,
  ];

  initialApproveWithSaveServices: number[] = [
    CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE
  ];

  approveWithSaveStatuses: number[] = [
    CommonCaseStatus.UNDER_PROCESSING,
    CommonCaseStatus.RETURNED
  ];

  finalApproveByMatrixServices: number[] = [
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.URGENT_INTERVENTION_LICENSING,
    CaseTypes.PROJECT_FUNDRAISING,
    // CaseTypes.FINANCIAL_TRANSFERS_LICENSING
  ];

  canShowMatrixNotification: boolean = false;
  matrixNotificationType!: 'success' | 'danger';
  matrixNotificationMsg!: string;
  viewReady: boolean = false;
  actionsTrigger: boolean = false;

  /**
   * @description Number of buttons to show before dropdown
   */
  buttonGroupCount: { [key in WrapperButtonsGroupEnum]: number } = {
    [WrapperButtonsGroupEnum.ONE]: 0,
    [WrapperButtonsGroupEnum.TWO]: 2,
    [WrapperButtonsGroupEnum.THREE]: 2,
    [WrapperButtonsGroupEnum.FOUR]: 0,
  }

  private buttonGroupLangKeys: { [key in WrapperButtonsGroupEnum]: (keyof ILanguageKeys | undefined) } = {
    [WrapperButtonsGroupEnum.ONE]: undefined,
    [WrapperButtonsGroupEnum.TWO]: 'btn_group_decision_actions',
    [WrapperButtonsGroupEnum.THREE]: 'btn_group_consultation_actions',
    [WrapperButtonsGroupEnum.FOUR]: undefined
  }

  ngOnDestroy(): void {
    this.destroy$.next('Destroy');
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.rebuildRouteStrategy();
    this.info = this.route.snapshot.data['info'] as (IOpenedInfo | null);
    const component = DynamicComponentService.getComponent(this.render);
    this.componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });
    this.component = this.componentRef.instance as EServicesGenericComponent<CaseModel<any, any>, BaseGenericEService<CaseModel<any, any>>>;

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
      this.displayRightActions(this.info?.openFrom ? (this.info.openFrom) : OpenFrom.ADD_SCREEN, true);
      this.checkForFinalApproveByMatrixNotification();
      this.viewReady = true;
    });
  }

  checkForFinalApproveByMatrixNotification(): void {
    let isValidManager = (this.employeeService.isLicensingManager() || this.employeeService.isLicensingChiefManager());

    if (this.model?.getCaseType() === CaseTypes.FINANCIAL_TRANSFERS_LICENSING) {
      isValidManager = (isValidManager || this.employeeService.isLicensingGeneralManager())
    }

    let canShowNotification: boolean = (!!this.model && this.finalApproveByMatrixServices.includes(this.model.getCaseType()))
      && (this.openFrom === OpenFrom.USER_INBOX || (this.openFrom === OpenFrom.TEAM_INBOX && this.model.taskDetails.isClaimed()))
      && isValidManager;

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
        disabled: (item) => {
          return (this.component.form.invalid || item?.alreadyStarted()) && !this.canSave();
        },
        show: (item) => {
          if (item.isCancelled() || this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType())) {
            return false;
          }

          if (item.caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
            if (this.model?.caseStatus === CommonCaseStatus.DRAFT ||
              this.model?.caseStatus === CommonCaseStatus.NEW) {
              return true;
            }
            if ((item as ProjectImplementation).isSubmissionMechanismRegistration() || (item as ProjectImplementation).isSubmissionMechanismNotification()) {
              return false;
            }
          }

          if (item.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
            const model = item as CoordinationWithOrganizationsRequest
            return this._isAllowedToSaveAtSearch(model);
          }
          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 1
        },
        tooltip: 'btn_info_save'
      },
      // launch
      {
        type: 'action',
        label: 'launch',
        show: (item: CaseModel<any, any>) => {
          if (this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType())) {
            return false;
          }
          return item.canStart();
        },
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        onClick: (_item: CaseModel<any, any>) => {
          this.launchAction(true);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 2
        },
        tooltip: 'btn_info_launch'
      },
      // save as draft
      {
        type: 'action',
        label: 'save_as_draft',
        show: (item) => {
          if (item.isCancelled() || this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType()) || this.excludedDraftTypes.includes(item.getCaseType())) {
            return false;
          }
          if (item.caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
            if (this.model?.caseStatus === CommonCaseStatus.DRAFT) {
              return true;
            }
            if ((item as ProjectImplementation).isSubmissionMechanismRegistration() || (item as ProjectImplementation).isSubmissionMechanismNotification()) {
              return false;
            }
          }
          if (item.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
            if (item.caseStatus === CommonCaseStatus.CANCELLED) {
              return false;
            }
          }
          return item?.canDraft();
        },
        disabled: item => !item?.canDraft(),
        onClick: () => {
          this.component.save.next(this.saveTypes.DRAFT);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 1,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || !this.component.componentTabsListRef.isLastActiveTab()
          }
        },
        tooltip: 'btn_info_save_as_draft'
      },
      // save as draft and continue
      {
        type: 'action',
        label: 'save_as_draft_and_continue',
        show: (item) => {
          if (this.internal) {
            return false;
          }
          if (item.isCancelled() || this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType()) || this.excludedDraftTypes.includes(item.getCaseType())) {
            return false;
          }
          if (item.caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
            if ((item as ProjectImplementation).isSubmissionMechanismRegistration() || (item as ProjectImplementation).isSubmissionMechanismNotification()) {
              return false;
            }
          }
          if (item.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
            if (item.caseStatus === CommonCaseStatus.CANCELLED) {
              return false;
            }
          }
          return item?.canDraft();
        },
        disabled: item => !item?.canDraft(),
        onClick: () => {
          this.component.save.next(this.saveTypes.DRAFT_CONTINUE);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 2,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || this.component.componentTabsListRef.isLastActiveTab()
          }
        },
        tooltip: 'btn_info_save_as_draft_and_continue'
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !!this.model?.id,
        onClick: (item: CaseModel<any, any>) => {
          item.viewLogs();
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 2
        },
        tooltip: 'btn_info_logs'
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: (item) => !this.internal && item.getCaseType() !== CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 1
        },
        tooltip: 'btn_info_print'
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 1
        },
        tooltip: 'btn_info_back'
      },
      // previous
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'previous',
        show: () => true,
        disabled: () => {
          if (!this.component.componentTabsListRef) {
            return true;
          }
          return this.component.componentTabsListRef.isFirstActiveTab();
        },
        onClick: () => this.component.goToPreviousActiveTab(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 0,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || this.component.componentTabsListRef.isFirstActiveTab()
          }
        },
        tooltip: 'btn_info_previous'
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
          return (this.component.form.invalid || item?.alreadyStarted()) && !this.canSave();
        },
        show: (item) => {
          if (item.isCancelled()) {
            return false;
          }
          if (this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType())) {
            return false;
          }

          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 1
        },
        tooltip: 'btn_info_save'
      },
      // launch
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'launch',
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item) => {
          return !this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType());
        },
        disabled: (item) => !item?.canStart(),
        onClick: () => {
          // this.component.launch();
          this.launchAction(false);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 2
        },
        tooltip: 'btn_info_launch'
      },
      // save as draft
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'save_as_draft',
        show: (item) => {
          if (this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType()) || this.excludedDraftTypes.includes(item.getCaseType())) {
            return false;
          }
          return item?.canDraft();
        },
        disabled: item => !item?.canDraft(),
        onClick: () => {
          this.component.save.next(this.saveTypes.DRAFT);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 1,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || !this.component.componentTabsListRef.isLastActiveTab()
          }
        },
        tooltip: 'btn_info_save_as_draft'
      },
      // save as draft and continue
      {
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'save_as_draft_and_continue',
        show: (item) => {
          if (this.internal) {
            return false;
          }
          if (this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType()) || this.excludedDraftTypes.includes(item.getCaseType())) {
            return false;
          }
          return item?.canDraft();
        },
        disabled: item => !item?.canDraft(),
        onClick: () => {
          this.component.save.next(this.saveTypes.DRAFT_CONTINUE);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 2,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || this.component.componentTabsListRef.isLastActiveTab()
          }
        },
        tooltip: 'btn_info_save_as_draft_and_continue'
      },
      // reset
      {
        class: 'btn-secondary',
        type: 'action',
        // icon: 'mdi-rocket-launch-outline',
        label: 'btn_reset',
        show: () => (!this.model?.id),
        onClick: () => {
          this.component.resetForm$.next(true);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 1
        },
        tooltip: 'btn_info_reset'
      },
      // previous
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'previous',
        onClick: () => this.component.goToPreviousActiveTab(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 0,
          hideByTabIndex: () => {
            return !this.component.componentTabsListRef || this.component.componentTabsListRef.isFirstActiveTab()
          }
        },
        tooltip: 'btn_info_previous'
      }
    ];
  }

  canSave(): boolean {
    if (this.model?.isCancelled()) {
      return false;
    }
    if (this.model?.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      const model = this.model as CoordinationWithOrganizationsRequest;
      return model.participatingOrganizaionList.length > 0;
    }
    const isServiceAllow = this.model?.caseType == CaseTypes.EMPLOYMENT;
    return (isServiceAllow && this.employeeService.isCharityManager()) || !!((this.employeeService.isCharityManager() || this.employeeService.isCharityUser()) && this.model?.isReturned());
  }

  canOrganizationApprove(): boolean {
    if (this.model?.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      const model = this.model as CoordinationWithOrganizationsRequest;
      return model.approved;
    } else if (this.model?.caseType === CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN) {
      const orgId = this.employeeService.getProfile()!.id;
      const officersList = (this.component as any).organizationOfficerComponentRef.list
      return (this.component as any).externalUserData.valid
        && officersList.filter((x: OrganizationOfficer) => x.organizationId == orgId).length
    }
    return true;
  }

  private launchAction(redirectOnSuccess: boolean = false) {
    this.component.launch().pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      if (redirectOnSuccess) {
        this.navigateToSamePageThatUserCameFrom();
      }
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
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 2
        },
        tooltip: 'btn_info_claim'
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !this.internal,
        onClick: (item: CaseModel<any, any>) => EServiceComponentWrapperComponent.viewLogsAction(item),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 2
        },
        tooltip: 'btn_info_logs'
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: (item) => !this.internal && item.getCaseType() !== CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 1
        },
        tooltip: 'btn_info_print'
      },
      // mark as unread
      {
        type: 'action',
        icon: ActionIconsEnum.CLOSE_MAIL,
        label: 'mark_as_unread',
        show: (_item) => true,
        onClick: (item) => this.markAsUnreadAction(item),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 3
        },
        tooltip: 'btn_info_mark_as_unread'
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 1
        },
        tooltip: 'btn_info_back'
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
        disabled: () => this.component.form.invalid || (this.component.readonly && !this.canSave()),
        show: (item) => {
          if (item.isCancelled()) {
            return false;
          }
          if (this.servicesWithNoSaveDraftLaunch.includes(item.getCaseType())) {
            return false;
          }
          if (item.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
            return this.isCoordinationApprovedWithSave(item);
          }
          if (item.caseType === CaseTypes.NPO_MANAGEMENT || item.caseType === CaseTypes.FOREIGN_COUNTRIES_PROJECTS) {
            return !this.internal || this.employeeService.getCurrentUser().generalUserId == this.model?.creatorInfo.id;
          }
          // show if external user or service which are only for internal user
          return !this.internal || this.internalUserServices.includes(item.getCaseType());
        },
        onClick: () => {
          this.component.save.next(this.saveTypes.FINAL);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 1
        },
        tooltip: 'btn_info_save'
      },
      // release
      {
        type: 'action',
        icon: 'mdi-hand-okay',
        label: 'release_task',
        askChecklist: true,
        show: item => item.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM),
        onClick: (item: CaseModel<any, any>) => this.releaseAction(item),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 2
        },
        tooltip: 'btn_info_release_task'
      },
      // send to competent department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_COMPETENT_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToDepartmentAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_competent_dep'
      },
      // Return to specific organization
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'return_to_org_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN_TO_SPECIFIC_ORGANIZATION);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnToSpecificOrganizationAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_return_to_org_task'
      },
      // send to multi department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_multi_departments',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.AWARENESS_ACTIVITY_SUGGESTION_SEND_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.CHARITY_ORGANIZATION_UPDATE_SEND_TO_MULTI_DEPARTMENTS)
            || (this.employeeService.getCurrentUser().generalUserId != this.model?.creatorInfo.id && item.getResponses().includes(WFResponseType.REVIEW_NPO_MANAGEMENT))
            || (this.employeeService.getCurrentUser().generalUserId != this.model?.creatorInfo.id && item.getResponses().includes(WFResponseType.FOREIGN_COUNTRIES_PROJECTS_LICENSING_SEND_TO_MULTI_DEPARTMENTS))
            || item.getResponses().includes(WFResponseType.PROJECT_FUNDRAISING_SEND_TO_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.ORGANIZATION_ENTITIES_SUPPORT_TO_MULTI_DEPARTMENTS)
            || item.getResponses().includes(WFResponseType.GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS)
            || item.caseType === CaseTypes.ORGANIZATION_ENTITIES_SUPPORT && this.employeeService.isLicensingUser();
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToMultiDepartmentsAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_multi_departments'
      },
      // send to single department (Supervision and control, risk and compliance, license department)
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: (item: CaseModel<any, any>) => {
          return this.getSendToSingleDepartmentLabelTooltip(item).label;
        },
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return this.isSendToSingleDepartmentAllowed(item);
        },
        onClick: (item: CaseModel<any, any>) => {
          if (item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT)) {
            this.sendToSingleDepartmentReportReviewAction(item);
            return;
          }
          this.sendToSingleDepartmentAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: (item: CaseModel<any, any>) => {
          return this.getSendToSingleDepartmentLabelTooltip(item).tooltip;
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_USER);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToUserAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_user'
      },
      // send to structural expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_structure_expert',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_CONSTRUCTION_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToStructureExpertAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_structure_expert'
      },
      // send to developmental expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_development_expert',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_DEVELOPMENT_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToDevelopmentExpertAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_development_expert'
      },
      // send to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_MANAGER);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToManagerAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_manager'
      },
      // send to Chief
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_chief',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.checkIfHasMissingConditions(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_CHIEF);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToChiefAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_chief'
      },
      // send to general Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_general_manager',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.SEND_TO_GM);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToGeneralManagerAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_general_manager'
      },
      // send to general Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_general_manager',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_GM);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToGMAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_general_manager'
      },
      // complete
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return (!item.getResponses().length || item.getResponses().includes(WFResponseType.COMPLETE)) && item.caseStatus != CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.completeAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 2
        },
        tooltip: 'btn_info_task_complete'
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.APPROVE) && item.caseState != CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.approveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_approve_task'
      },
      // send to general meeting members
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_members',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.TO_GENERAL_MEETING_MEMBERS) && !(item as GeneralAssociationMeetingAttendance).isSendToMember && item.caseStatus != CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.sendToGeneralMeetingMembersAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_send_to_members'
      },
      // download final report
      {
        type: 'action',
        label: 'generate_final_report',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          const model = item as unknown as IGeneralAssociationMeetingAttendanceFinalApprove;
          return (item.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE
            && (model.isManagerFinalReviewStep() || item.caseStatus === CommonCaseStatus.FINAL_APPROVE));
        },
        onClick: (item: CaseModel<any, any>) => {
          const model = item as unknown as IGeneralAssociationMeetingAttendanceFinalApprove;
          model.downloadFinalReport();
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_generate_final_report'
      },
      // initial approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'initial_approve_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.INITIAL_APPROVE) && item.caseState != CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.initialApproveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_initial_approve_task'
      },
      // organization approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'org_approve_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        disabled: () => !this.canOrganizationApprove(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationApproveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_org_approve_task'
      },
      // organization final approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'organization_final_approve',
        askChecklist: true,
        disabled: () => !this.canOrganizationApprove(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_FINAL_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationFinalApproveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_organization_final_approve'
      },
      // organization final reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'organization_final_reject',
        askChecklist: true,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_FINAL_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationFinalRejectAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_organization_final_reject'
      },
      // validate approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'validate_approve_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.VALIDATE_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.validateApproveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_validate_approve_task'
      },
      // knew
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return !!(item.getResponses().length && item.getResponses().includes(WFResponseType.KNEW));
        },
        onClick: (item: CaseModel<any, any>) => {
          this.knewAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_task_complete'
      },
      // seen
      {
        type: 'action',
        icon: 'mdi-eye',
        label: 'task_seen',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return !!(item.getResponses().length && item.getResponses().includes(WFResponseType.SEEN));
        },
        onClick: (item: CaseModel<any, any>) => {
          this.seenAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_task_seen'
      },
      // final approve
      {
        type: 'action',
        icon: 'mdi-check-underline',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        label: (item) => this.finalApproveByMatrixServices.includes(item.getCaseType()) ? this.lang.map.final_approve_task_based_on_matrix : this.lang.map.final_approve_task,
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.FINAL_APPROVE) && item.getCaseStatus() != CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalApproveAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: (item) => {
          return this.finalApproveByMatrixServices.includes(item.getCaseType()) ? this.lang.map.btn_info_final_approve_task_based_on_matrix : this.lang.map.btn_info_final_approve_task;
        }
      },
      // final notification
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'final_Notification',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.FINAL_NOTIFICATION);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalNotification(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_final_notification'
      },
      // ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.askForConsultationAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.THREE,
          groupOrder: 4
        },
        tooltip: 'btn_info_ask_for_consultation_task'
      },
      // postpone
      {
        type: 'action',
        icon: 'mdi-calendar-clock',
        label: 'postpone_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.POSTPONE);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.postponeAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_postpone_task'
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 2
        },
        tooltip: 'btn_info_return_task'
      },
      // final reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'final_reject_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.FINAL_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.finalRejectAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_final_reject_task'
      },
      // organization reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'organization_reject_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.ORGANIZATION_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.organizationRejectAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_organization_reject_task'
      },
      // validate reject
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'validate_reject_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.VALIDATE_REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.validateRejectAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_validate_reject_task'
      },
      // return to organization
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_to_org_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.RETURN_TO_ORG);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.returnToOrganizationAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_return_to_org_task'
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return item.getResponses().includes(WFResponseType.REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.rejectAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 4
        },
        tooltip: 'btn_info_reject_task'
      },
      //close/cancel task
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'cancel_task',
        askChecklist: true,
        runBeforeShouldSuccess: () => this.component.checkIfHasMissingRequiredAttachments(),
        show: (item: CaseModel<any, any>) => {
          return (item.getResponses().includes(WFResponseType.CLOSE) &&
            ((item.caseType !== CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE &&
              item.caseType !== CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE) ||
              (item.caseType == CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE && (item.caseStatus == CommonCaseStatus.CANCELLED || this.employeeService.isCharityManager()))));
        },
        onClick: (item: CaseModel<any, any>) => {
          this.closeAction(item);
        },
        data: {
          buttonGroup: WrapperButtonsGroupEnum.TWO,
          groupOrder: 3
        },
        tooltip: 'btn_info_cancel_task'
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        show: () => !this.internal,
        onClick: (item: CaseModel<any, any>) => EServiceComponentWrapperComponent.viewLogsAction(item),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 2
        },
        tooltip: 'btn_info_logs'
      },
      // print
      {
        type: 'action',
        icon: ActionIconsEnum.PRINT,
        label: 'print',
        show: (item) => !this.internal && item.getCaseType() !== CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
        disabled: () => !this.model || !this.model.id,
        onClick: () => this.print(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.FOUR,
          groupOrder: 1
        },
        tooltip: 'btn_info_print'
      },
      // mark as unread
      {
        type: 'action',
        icon: ActionIconsEnum.CLOSE_MAIL,
        label: 'mark_as_unread',
        show: (_item) => true,
        onClick: (item) => this.markAsUnreadAction(item),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 3
        },
        tooltip: 'btn_info_mark_as_unread'
      },
      // back
      {
        type: 'action',
        class: 'btn-secondary',
        label: 'back',
        show: () => true,
        onClick: () => this.navigateToSamePageThatUserCameFrom(),
        data: {
          buttonGroup: WrapperButtonsGroupEnum.ONE,
          groupOrder: 1
        },
        tooltip: 'btn_info_back'
      }
    ];
  }

  private isSendToSingleDepartmentAllowed(item: CaseModel<any, any>): boolean {
    return item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.COLLECTION_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.COLLECTOR_LICENSING_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.FUNDRAISING_LICENSE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_CLOSURE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.PROJECT_COMPLETION_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.PROJECT_IMPLEMENTATION_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.FINANCIAL_TRANSFER_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT)
      ;
  }

  private getSendToSingleDepartmentLabelTooltip(item: CaseModel<any, any>): { label: string, tooltip: string } {
    let isSendToRiskAndCompliance: boolean = (item.getResponses().includes(WFResponseType.INITIAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.PARTNER_APPROVAL_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.FINAL_EXTERNAL_OFFICE_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.CUSTOMS_EXEMPTION_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_FOLLOWUP_SEND_TO_SINGLE_DEPARTMENT)
      || item.getResponses().includes(WFResponseType.FINANCIAL_TRANSFER_SEND_TO_SINGLE_DEPARTMENT)
    );
    let isSendToLicenseDepartment = item.getResponses().includes(WFResponseType.URGENT_INTERVENTION_CLOSURE_SEND_TO_SINGLE_DEPARTMENT)
    || item.getResponses().includes(WFResponseType.PROJECT_COMPLETION_SEND_TO_SINGLE_DEPARTMENT);
    let result: { label: string, tooltip: string } = {label: '', tooltip: ''};
    if (isSendToRiskAndCompliance) {
      result.label = this.lang.map.send_to_risk_and_compliance_department;
      result.tooltip = this.lang.map.btn_info_send_to_risk_and_compliance_department;
    } else if (isSendToLicenseDepartment) {
      result.label = this.lang.map.send_to_license_department;
      result.tooltip = this.lang.map.btn_info_send_to_license_department;
    } else {
      result.label = this.lang.map.send_to_supervision_and_control_department;
      result.tooltip = this.lang.map.btn_info_send_to_supervision_and_control_department;
    }
    return result;
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
      case OpenFrom.SEARCH:
        const caseType = this.route.snapshot.params.caseType;
        this.router.navigate(['/home/services/search/' + caseType, this.route.snapshot.params]).then();
        break;
    }

  }

  private triggerActionsChanged(): void {
    this.actionsTrigger = true;
    setTimeout(() => {
      this.actionsTrigger = false;
    })
  }

  private displayRightActions(openFrom: OpenFrom, isInit: boolean = false) {
    if (!this.shouldFollowTheOpenFrom(openFrom)) {
      openFrom = this.getTheRightOpenForm();
    }
    this.openFrom = openFrom;
    this.component.openFrom = openFrom;
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
    this.actions = this.translateActions(this.actions);
    !isInit && this.triggerActionsChanged();
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
      // this.actions = this.translateActions(this.actions);
      this.component.allowEditRecommendations = false;
      this.component.readonly = true;
      const component = (this.component as IESComponent<any>);
      if (component.handleReadonly && typeof component.handleReadonly === 'function') {
        component.handleReadonly();
      }
    });
  }

  private claimAction(item: CaseModel<any, any>) {
    item.claim().subscribe(() => {
      this.toast.success(this.lang.map.task_have_been_claimed_successfully);
      item.addClaimAction((this.employeeService.getCurrentUser() as (ExternalUser | InternalUser)).getUniqueName());
      this.displayRightActions(OpenFrom.USER_INBOX);
      // this.actions = this.translateActions(this.actions);
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

  private sendToSingleDepartmentReportReviewAction(item: CaseModel<any, any>) {
    (item as UrgentInterventionLicenseFollowup).sendToSingleDepartmentReportReviewAction().subscribe(() => {
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

  private sendToChiefAction(item: CaseModel<any, any>) {
    item.sendToChief().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToGeneralManagerAction(item: CaseModel<any, any>) {
    item.sendToGeneralManager().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private sendToGMAction(item: CaseModel<any, any>) {
    item.sendToGM().onAfterClose$.subscribe((actionTaken) => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private finalNotification(item: CaseModel<any, any>) {
    item.finalNotification().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  isCompleteWithSave(item: CaseModel<any, any>): boolean {
    return this.completeWithSaveServices.includes(item.getCaseType()) && this.completeWithSaveStatuses.includes(item.caseStatus);
  }

  private completeAction(item: CaseModel<any, any>) {
    if (this.isCompleteWithSave(item)) {
      if (item.getCaseType() === CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD) {
        const model = item as unknown as ITransferIndividualFundsAbroadComplete;
        const component = this.component as unknown as TransferringIndividualFundsAbroadComponent;
        let executives = component.executiveManagementListComponentRef?.list ?? [];
        let purposes = component.transferPurposeListRef?.list ?? [];
        model.completeWithForm(component.form, executives, purposes).onAfterClose$.subscribe(actionTaken => {
          actionTaken && this.navigateToSamePageThatUserCameFrom();
        });
      } else if (item.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
        const model = item as unknown as IGeneralAssociationMeetingAttendanceComplete;
        const component = this.component as unknown as IGeneralAssociationMeetingAttendanceComponent;

        model.completeWithSave(component.form, component.selectedAdministrativeBoardMembers, component.selectedGeneralAssociationMembers, component.agendaItems).onAfterClose$.subscribe(actionTaken => {
          actionTaken && this.navigateToSamePageThatUserCameFrom();
        });
      }
    } else if (item.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE && this.cantCompleteFromMemberReviewStep(item)) {
      const model = item as unknown as IGeneralAssociationMeetingAttendanceComplete;

      model.memberCanNotComplete();
    } else {
      item.complete().onAfterClose$.subscribe(actionTaken => {
        actionTaken && this.navigateToSamePageThatUserCameFrom();
      });
    }
  }

  cantCompleteFromMemberReviewStep(item: CaseModel<any, any>): boolean {
    const model = item as unknown as IGeneralAssociationMeetingAttendanceComplete;
    const component = this.component as unknown as IGeneralAssociationMeetingAttendanceComponent;

    return model.isMemberReviewStep() && component.meetingPointsForm.invalid;
  }

  isApproveWithSave(item: CaseModel<any, any>): boolean {
    return this.approveWithSaveServices.includes(item.getCaseType()) && this.approveWithSaveStatuses.includes(item.caseStatus);
  }

  isInitialApproveWithSave(item: CaseModel<any, any>): boolean {
    return this.initialApproveWithSaveServices.includes(item.getCaseType());
  }

  isCoordinationApprovedWithSave(item: CaseModel<any, any>): boolean {
    if (item.caseStatus === CommonCaseStatus.CANCELLED) {
      return false;
    }
    //@ts-ignore
    if (item.isApproved && this.internal) {
      return false;
    }
    return !item.isInitialApproved() || !this.internal;
  }

  private _isAllowedToSaveAtSearch(model: CoordinationWithOrganizationsRequest) {
    if (this.employeeService.isInternalUser() && !model.isApproved) {
      return true;
    }
    return this.employeeService.isExternalUser() && model.isApproved && !model.isFinalApproved();
  }

  private approveAction(item: CaseModel<any, any>) {
    if (this.isApproveWithSave(item)) {
      if (item.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
        const model = item as unknown as IGeneralAssociationMeetingAttendanceApprove;
        const component = this.component as unknown as IGeneralAssociationMeetingAttendanceComponent;
        const meetingDate = component.meetingDate.value;
        const year = component.year.value;

        model.approveWithSave(component.selectedInternalUsers, meetingDate, year).onAfterClose$.subscribe(actionTaken => {
          actionTaken && this.navigateToSamePageThatUserCameFrom();
        });
      } else if (item.getCaseType() === CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) {
        const model = item as unknown as AwarenessActivitySuggestion;
        const component = this.component as unknown as AwarenessActivitySuggestionComponent;
        component.validateTimplate()
          .pipe(
            tap(valid => !valid && this.service.dialog.error(this.lang.map.err_required_field + ' ' + this.lang.map.lbl_template)),
            filter(valid => valid)
          ).subscribe(() => {
            model.approveWithSave(component.form).onAfterClose$.subscribe(actionTaken => {
              actionTaken && this.navigateToSamePageThatUserCameFrom();
            });
          })
      }
    } else {
      item.approve().onAfterClose$.subscribe(actionTaken => {
        actionTaken && this.navigateToSamePageThatUserCameFrom();
      });
    }
  }

  private sendToGeneralMeetingMembersAction(item: CaseModel<any, any>) {
    const service = this.inboxService.getService(item.getCaseType());
    service.dialog.confirm(this.lang.map.msg_confirm_send_to_members).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          (item as unknown as IGeneralAssociationMeetingAttendanceSpecialActions).proceedSendToMembers(item.id).subscribe(() => {
            this.toast.success(this.lang.map.msg_success_send_to_members);
            this.navigateToSamePageThatUserCameFrom();
          });
        }
      });
  }

  private initialApproveAction(item: CaseModel<any, any>) {
    if (this.isInitialApproveWithSave(item)) {
      if (item.getCaseType() === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
        const model = item as unknown as IGeneralAssociationMeetingAttendanceApprove;
        const component = this.component as unknown as IGeneralAssociationMeetingAttendanceComponent;
        const meetingDate = component.meetingDate.value;
        const year = component.year.value;

        model.initialApproveWithSave(component.selectedInternalUsers, meetingDate, year).onAfterClose$.subscribe(actionTaken => {
          actionTaken && this.navigateToSamePageThatUserCameFrom();
        });
      }
    } else {
      item.initialApprove().onAfterClose$.subscribe(actionTaken => {
        actionTaken && this.navigateToSamePageThatUserCameFrom();
      });
    }
  }

  private organizationApproveAction(item: CaseModel<any, any>) {
    item.organizationApprove({
      form: this.component.form,
      organizationOfficers: (this.component as any).organizationOfficerComponentRef.list
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

  private knewAction(item: CaseModel<any, any>) {
    item.knew().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private seenAction(item: CaseModel<any, any>) {
    item.seen().onAfterClose$.subscribe(actionTaken => {
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
    item.returnToSpecificOrganizationWithComment().onAfterClose$.subscribe(noOrganizationsRemaining => {
      if (!noOrganizationsRemaining) {
        // reload component
        this.service.getTask(this.info?.taskId!).subscribe(model => {
          this.component.outModel = model;
          this.model = model;
          this.model.setInboxService(this.inboxService);
        });
      }
      noOrganizationsRemaining && this.navigateToSamePageThatUserCameFrom();
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

  private organizationFinalApproveAction(item: CaseModel<any, any>) {
    item.organizationFinalApprove({
      form: this.component.form,
      organizationOfficers: (this.component as any).organizationOfficerComponentRef.list
    }).onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private organizationFinalRejectAction(item: CaseModel<any, any>) {
    item.organizationFinalReject().onAfterClose$.subscribe(actionTaken => {
      actionTaken && this.navigateToSamePageThatUserCameFrom();
    });
  }

  private markAsUnreadAction(item: CaseModel<any, any>) {
    item.markAsUnread().subscribe(() => {
      this.toast.success(this.lang.map.msg_mark_as_unread_success);
      this.navigateToSamePageThatUserCameFrom();
    });
  }

  /*private terminateTaskAction(item: CaseModel<any, any>) {
    const service = this.inboxService.getService(item.getCaseType());
    service.dialog.confirm(this.lang.map.msg_confirm_terminate_task).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          item.terminateTask().subscribe(() => {
            this.toast.success(this.lang.map.msg_success_terminate_task);
            this.navigateToSamePageThatUserCameFrom();
          });
        }
      });
  }*/

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
    // this.translateActions(this.actions);
  }

  private listenToModelChange(): void {
    this.component.onModelChange$
      // .pipe(skip(1))
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
      action.translatedTooltip = !action.tooltip ? '' : ((typeof action.tooltip === 'function' && this.model) ? action.tooltip(this.model) : this.lang.map[action.tooltip as keyof ILanguageKeys]);
      return action;
    });
  }

  private checkIfHasMissingConditions() {
    if (this.model?.caseType === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST) {
      const model = this.model as CoordinationWithOrganizationsRequest;
      if (!model.coordinationReportId) {
        this.service.dialog.info(this.lang.map.msg_final_report_required);
        return of(false);
      }
      if (model.participatingOrganizaionList.some(org => model.locations.some(location => location.organizationId === org.organizationId))) {
        this.service.dialog.info(this.lang.map.msg_terminate_all_tasks);
        return of(false);
      }

    }
    return this.component.checkIfHasMissingRequiredAttachments();
  }

  isAllowedToEditRecommendations(model: CaseModel<any, any>, from: OpenFrom): boolean {
    return this.employeeService.isInternalUser() && (from === OpenFrom.USER_INBOX || (from === OpenFrom.SEARCH && model.canStart()) || (model.taskDetails && model.taskDetails.actions && model.taskDetails.actions.indexOf(WFActions.ACTION_CANCEL_CLAIM) !== -1));
  }

  isClaimed(model: CaseModel<any, any>) {
    return model.taskDetails && model.taskDetails.actions && model.taskDetails.actions.indexOf(WFActions.ACTION_CANCEL_CLAIM) !== -1;
  }

  isAttachmentReadonly(): boolean {
    if (!this.component.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.component.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.component.model.taskDetails!.isClaimed();
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
      return this.runBeforeActionCallbacks(action)
        .pipe(filter(value => value))
        .subscribe(() => this.model && action.onClick && action.onClick(this.model));
    });
  }

  runBeforeActionCallbacks(action: IMenuItem<CaseModel<any, any>>): Observable<boolean> {
    return of(true)
      .pipe(tap(() => action.runBefore && this.model ? action.runBefore(this.model) : null))
      .pipe(switchMap(() => {
        const result = action.runBeforeShouldSuccess && this.model ? action.runBeforeShouldSuccess(this.model) : of(true);
        return isObservable(result) ? result : of(result);
      }));
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

  isOpenedFromTeamInbox(): boolean {
    return this.openFrom === OpenFrom.TEAM_INBOX;
  }

  isMainDepartmentRequest(): boolean {
    if (!!this.component && !!this.component.model) {
      if (this.isOpenedFromInbox() || (this.isOpenedFromTeamInbox() && this.component.model.taskDetails.isClaimed())) {
        return this.component.model.isMain();
      }
    }
    return false;
  }
}
