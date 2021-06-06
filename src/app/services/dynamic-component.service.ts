import {ComponentType} from '@angular/cdk/overlay';
import {InquiryComponent} from '../e-services/pages/inquiry-container/inquiry/inquiry.component';
import {ConsultationComponent} from '../e-services/pages/consultation-container/consultation/consultation.component';
import {InternationalCooperationComponent} from '../e-services/pages/international-cooperation-container/international-cooperation/international-cooperation.component';

export class DynamicComponentService {
  static components: Map<string, ComponentType<any>> = new Map<string, ComponentType<any>>();

  constructor() {
    DynamicComponentService.registerComponent('InquiryComponent', InquiryComponent);
    DynamicComponentService.registerComponent('ConsultationComponent', ConsultationComponent);
    DynamicComponentService.registerComponent('InternationalCooperationComponent', InternationalCooperationComponent);
  }

  static getComponent(name: string): ComponentType<any> {
    return DynamicComponentService.components.get(name)!;
  }

  static registerComponent(name: string, component: ComponentType<any>): void {
    DynamicComponentService.components.set(name, component);
  }
}
