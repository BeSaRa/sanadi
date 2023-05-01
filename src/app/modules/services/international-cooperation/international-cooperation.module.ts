import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InternationalCooperationRoutingModule } from './international-cooperation-routing.module';
import { InternationCooperationOutputsComponent } from './pages/internation-cooperation-outputs/internation-cooperation-outputs.component';
import {
  InternationalCooperationComponent
} from '@modules/services/international-cooperation/pages/international-cooperation/international-cooperation.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import { AuditInternationalCooperationComponent } from './audit/audit-international-cooperation/audit-international-cooperation.component';


@NgModule({
  declarations: [
    InternationalCooperationComponent,
    InternationCooperationOutputsComponent,
    AuditInternationalCooperationComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    InternationalCooperationRoutingModule
  ]
})
export class InternationalCooperationModule { }
