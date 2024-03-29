import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ConsultationRoutingModule} from './consultation-routing.module';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {ConsultationComponent} from '@modules/services/consultation/pages/consultation/consultation.component';
import {ConsultationOutputsComponent} from './pages/consultation-outputs/consultation-outputs.component';
import { AuditConsultationComponent } from './audit/audit-consultation/audit-consultation.component';


@NgModule({
  declarations: [
    ConsultationComponent,
    ConsultationOutputsComponent,
    AuditConsultationComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    ConsultationRoutingModule
  ]
})
export class ConsultationModule {
}
