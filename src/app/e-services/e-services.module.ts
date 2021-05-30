import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EServicesRoutingModule} from './e-services-routing.module';
import {EServicesComponent} from './e-services.component';
import {SharedModule} from '../shared/shared.module';
import { InquiryComponent } from './pages/inquiry-container/inquiry/inquiry.component';
import { InquiryContainerComponent } from './pages/inquiry-container/inquiry-container.component';


@NgModule({
  declarations: [
    EServicesComponent,
    InquiryComponent,
    InquiryContainerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EServicesRoutingModule
  ]
})
export class EServicesModule {
}
