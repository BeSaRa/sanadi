import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EServicesRoutingModule} from './e-services-routing.module';
import {EServicesComponent} from './e-services.component';
import {SharedModule} from '../shared/shared.module';
import {InquiryComponent} from './pages/inquiry-container/inquiry/inquiry.component';
import {InquiryContainerComponent} from './pages/inquiry-container/inquiry-container.component';
import {ConsultationContainerComponent} from './pages/consultation-container/consultation-container.component';
import {ConsultationComponent} from './pages/consultation-container/consultation/consultation.component';
import { InternationalCooperationContainerComponent } from './pages/international-cooperation-container/international-cooperation-container.component';


@NgModule({
  declarations: [
    EServicesComponent,
    InquiryComponent,
    InquiryContainerComponent,
    ConsultationContainerComponent,
    ConsultationComponent,
    InternationalCooperationContainerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EServicesRoutingModule
  ]
})
export class EServicesModule {
}
