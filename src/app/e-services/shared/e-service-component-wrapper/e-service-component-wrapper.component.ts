import {Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DynamicComponentService} from "@app/services/dynamic-component.service";

@Component({
  selector: 'e-service-component-wrapper',
  templateUrl: './e-service-component-wrapper.component.html',
  styleUrls: ['./e-service-component-wrapper.component.scss']
})
export class EServiceComponentWrapperComponent implements OnInit {
  @ViewChild('template', {read: ViewContainerRef, static: true})
  container!: ViewContainerRef;
  render: string;

  constructor(private activeRoute: ActivatedRoute, private injector: Injector, private cfr: ComponentFactoryResolver) {
    this.render = this.activeRoute.snapshot.data.render as string;
    if (!this.render) {
      throw Error(`Please Provide render property in this route ${activeRoute.snapshot.url}`)
    }
  }

  async ngOnInit(): Promise<void> {
    const component = DynamicComponentService.getComponent(this.render);
    this.container.clear();
    const componentFactory = this.cfr.resolveComponentFactory(component);
    const componentRef = componentFactory.create(this.injector);
    // const instance  = componentRef.instance as IESComponent;
    // instance.outModel = new Inquiry().clone({
    //   id: `{166858898989888465656}`
    // })
    this.container.insert(componentRef.hostView);
  }

}
