import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralServicesRoutingModule } from './general-services-routing.module';
import { GeneralServicesComponent } from './general-services.component';
import {SharedModule} from '@app/shared/shared.module';
import {InquiryComponent} from '@app/modules/general-services/pages/inquiry/inquiry.component';
import {ConsultationComponent} from '@app/modules/general-services/pages/consultation/consultation.component';
import {
  InternationalCooperationComponent
} from '@app/modules/general-services/pages/international-cooperation/international-cooperation.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import { JobApplicationComponent } from '@app/modules/general-services/pages/job-application/job-application.component';


@NgModule({
  declarations: [
    GeneralServicesComponent,
    InquiryComponent,
    ConsultationComponent,
    InternationalCooperationComponent,
    JobApplicationComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralServicesRoutingModule,
  ]
})
export class GeneralServicesModule { }
