import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver, ComponentRef,
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

@Component({
  selector: 'e-service-component-wrapper',
  templateUrl: './e-service-component-wrapper.component.html',
  styleUrls: ['./e-service-component-wrapper.component.scss']
})
export class EServiceComponentWrapperComponent implements OnInit, AfterViewInit {
  private readonly render: string;
  @ViewChild('internalContainer', {read: ViewContainerRef})
  internalContainer!: ViewContainerRef;

  @ViewChild('externalContainer', {read: ViewContainerRef})
  externalContainer!: ViewContainerRef;

  component!: EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>

  private componentRef!: ComponentRef<EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<any>>>

  internal: boolean = this.employeeService.isInternalUser();

  constructor(private activeRoute: ActivatedRoute,
              private injector: Injector,
              private employeeService: EmployeeService,
              public lang: LangService,
              private cfr: ComponentFactoryResolver) {
    this.render = this.activeRoute.snapshot.data.render as string;
    if (!this.render) {
      throw Error(`Please Provide render property in this route ${activeRoute.snapshot.url}`)
    }
  }

  async ngOnInit(): Promise<void> {
    const component = DynamicComponentService.getComponent(this.render);
    const componentFactory = this.cfr.resolveComponentFactory(component);
    this.componentRef = componentFactory.create(this.injector);
    // const instance  = componentRef.instance as IESComponent;
    // instance.outModel = new Inquiry().clone({
    //   id: `{166858898989888465656}`
    // })
    this.component = this.componentRef.instance as EServicesGenericComponent<CaseModel<any, any>, EServiceGenericService<CaseModel<any, any>>>;
    this.component.accordionView = this.employeeService.isInternalUser();
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
}
