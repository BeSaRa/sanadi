import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EServicesRoutingModule} from './e-services-routing.module';
import {EServicesComponent} from './e-services.component';
import {SharedModule} from '../shared/shared.module';
import { InquiriesComponent } from './pages/inquiries/inquiries.component';


@NgModule({
  declarations: [EServicesComponent, InquiriesComponent],
  imports: [
    CommonModule,
    SharedModule,
    EServicesRoutingModule
  ]
})
export class EServicesModule {
}
