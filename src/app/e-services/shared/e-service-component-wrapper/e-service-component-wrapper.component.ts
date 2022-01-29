import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DynamicComponentService} from "@app/services/dynamic-component.service";
import {EmployeeService} from "@app/services/employee.service";
import {LangService} from "@app/services/lang.service";
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {CaseModel} from "@app/models/case-model";
import {OpenFrom} from "@app/enums/open-from.enum";
import {IOpenedInfo} from "@app/interfaces/i-opened-info";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {WFActions} from "@app/enums/wfactions.enum";
import {CaseTypes} from "@app/enums/case-types.enum";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";

@Component({
  selector: 'e-service-component-wrapper',
  templateUrl: './e-service-component-wrapper.component.html',
  styleUrls: ['./e-service-component-wrapper.component.scss']
})
export class EServiceComponentWrapperComponent implements OnInit, AfterViewInit {
  constructor(private route: ActivatedRoute,
              private injector: Injector,
              private employeeService: EmployeeService,
              public lang: LangService,
              private cfr: ComponentFactoryResolver) {
    this.render = this.route.snapshot.data.render as string;
    if (!this.render) {
      throw Error(`Please Provide render property in this route ${route.snapshot.url}`)
    }
  }

  private userInboxActions: IMenuItem<CaseModel<any, any>>[] = [];
  private teamInboxActions: IMenuItem<CaseModel<any, any>>[] = [];
  private searchActions: IMenuItem<CaseModel<any, any>>[] = [];

  private readonly render: string;
  private componentRef!: ComponentRef<EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<any>>>
  @ViewChild('internalContainer', {read: ViewContainerRef})
  internalContainer!: ViewContainerRef;

  @ViewChild('externalContainer', {read: ViewContainerRef})
  externalContainer!: ViewContainerRef;

  actions: IMenuItem<CaseModel<any, any>>[] = [];
  service!: EServiceGenericService<CaseModel<any, any>>
  model?: CaseModel<any, any>
  component!: EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>


  internal: boolean = this.employeeService.isInternalUser();

  async ngOnInit(): Promise<void> {
    const info = this.route.snapshot.data['info'] as (IOpenedInfo | null);

    const component = DynamicComponentService.getComponent(this.render);
    const componentFactory = this.cfr.resolveComponentFactory(component);
    this.componentRef = componentFactory.create(this.injector);
    this.component = this.componentRef.instance as EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>;
    this.service = this.component.service;
    this.component.accordionView = this.employeeService.isInternalUser();
    if (info) {
      this.component.outModel = info.model;
      this.model = info.model;
      this.displayRightActions(info.openFrom);
    }
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.internal ? this.internalContainer.clear() : this.externalContainer.clear();
      this.internal ? this.internalContainer.insert(this.componentRef.hostView) : this.externalContainer.insert(this.componentRef.hostView)
    });
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
      let caseStatus = this.component.model.getCaseStatus(),
        caseStatusEnum = this.component.service.caseStatusEnumMap[this.component.model.getCaseType()];

      if (caseStatusEnum) {
        isAllowed = (caseStatus !== caseStatusEnum.CANCELLED && caseStatus !== caseStatusEnum.FINAL_APPROVE && caseStatus !== caseStatusEnum.FINAL_REJECTION);
      }
    }

    return !isAllowed;
  }

  print() {
    this.model?.exportModel().subscribe((blob) => window.open(blob.url))
  }

  private buildSearchActions(): void {
    this.searchActions = [];
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
          // this.actionClaim(item, dialogRef, loadedModel, component, caseViewerComponent);
        }
      }
    ];
  }

  private buildUserInboxActions(): void {
    this.userInboxActions = [
      // release
      {
        type: 'action',
        icon: 'mdi-hand-okay',
        label: 'release_task',
        show: item => item.taskDetails.actions.includes(WFActions.ACTION_CANCEL_CLAIM),
        onClick: (item: CaseModel<any, any>) => true /*this.actionRelease(item, viewDialogRef)*/
      },
      // send to department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_competent_dep',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_COMPETENT_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToDepartment(item, viewDialogRef);
        }
      },
      // send to multi department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_multi_departments',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToMultiDepartments(item, viewDialogRef);
        }
      },
      // send to Supervision and control department
      {
        type: 'action',
        icon: 'mdi-send-circle',
        label: 'send_to_supervision_and_control_department',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.INTERNAL_PROJECT_SEND_TO_SINGLE_DEPARTMENT);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToSupervisionAndControlDepartment(item, viewDialogRef);
        }
      },
      // send to user
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_user',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_USER);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToUser(item, viewDialogRef);
        }
      },
      // send to structural expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_structure_expert',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_CONSTRUCTION_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToStructureExpert(item, viewDialogRef);
        }
      },
      // send to developmental expert
      {
        type: 'action',
        icon: 'mdi-account-arrow-right',
        label: 'send_to_development_expert',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_DEVELOPMENT_EXPERT);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToDevelopmentExpert(item, viewDialogRef);
        }
      },
      // send to Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_manager',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_MANAGER);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToManager(item, viewDialogRef);
        }
      },
      // send to general Manager
      {
        type: 'action',
        icon: 'mdi-card-account-details-star',
        label: 'send_to_general_manager',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.TO_GM);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionSendToGeneralManager(item, viewDialogRef);
        }
      },
      {
        type: 'action',
        icon: 'mdi-book-check',
        label: 'task_complete',
        show: (item: CaseModel<any, any>) => {
          return !item.taskDetails.responses.length || item.taskDetails.responses.includes(WFResponseType.COMPLETE);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionComplete(item, viewDialogRef);
        }
      },
      // approve
      {
        type: 'action',
        icon: 'mdi-check-bold',
        label: 'approve_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionApprove(item, viewDialogRef);
        }
      },
      // final approve
      {
        type: 'action',
        icon: 'mdi-check-underline',
        label: (item) => item.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE ? this.lang.map.final_approve_task_based_on_matrix : this.lang.map.final_approve_task,
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.FINAL_APPROVE);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionFinalApprove(item, viewDialogRef);
        }
      },
      // ask for consultation
      {
        type: 'action',
        icon: 'mdi-help-rhombus-outline',
        label: 'ask_for_consultation_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.some(x => x.indexOf(WFResponseType.ASK_FOR_CONSULTATION) > -1);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionAskForConsultation(item, viewDialogRef);
        }
      },
      // postpone
      {
        type: 'action',
        icon: 'mdi-calendar-clock',
        label: 'postpone_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.POSTPONE);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionPostpone(item, viewDialogRef);
        }
      },
      // return
      {
        type: 'action',
        icon: 'mdi-undo-variant',
        label: 'return_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.RETURN);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionReturn(item, viewDialogRef);
        }
      },
      // reject
      {
        type: 'action',
        icon: 'mdi-book-remove-outline',
        label: 'reject_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.REJECT);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionReject(item, viewDialogRef);
        }
      },
      //close/cancel task
      {
        type: 'action',
        icon: 'mdi-close-circle-outline',
        label: 'cancel_task',
        show: (item: CaseModel<any, any>) => {
          return item.taskDetails.responses.includes(WFResponseType.CLOSE);
        },
        onClick: (item: CaseModel<any, any>) => {
          // this.actionClose(item, viewDialogRef);
        }
      }
    ]
  }

  private displayRightActions(openFrom: OpenFrom) {
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
      case OpenFrom.ADD_SCREEN:
      default:
        this.buildSearchActions();
        this.actions = this.actionShowFilter(this.searchActions);
    }
    this.actions = this.translateActions(this.actions);
  }

  private actionShowFilter(actions: IMenuItem<CaseModel<any, any>>[]): IMenuItem<CaseModel<any, any>>[] {
    return actions.filter((action) => action.show && this.model ? action.show(this.model) : true)
  }

  translateActions(actions: IMenuItem<CaseModel<any, any>>[]): IMenuItem<CaseModel<any, any>>[] {
    return actions.map((action) => {
      action.translatedLabel = (typeof action.label === 'function' && this.model) ? action.label(this.model) : this.lang.map[action.label as keyof ILanguageKeys]
      return action
    })
  }

  actionCallback(action: IMenuItem<CaseModel<any, any>>) {
    action.onClick && this.model && action.onClick(this.model);
  }


}
