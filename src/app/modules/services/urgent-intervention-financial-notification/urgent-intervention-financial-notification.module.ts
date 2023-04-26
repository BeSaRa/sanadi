import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UrgentInterventionFinancialNotificationRoutingModule } from './urgent-intervention-financial-notification-routing.module';
import { UrgentInterventionFinancialNotificationOutputsComponent } from './pages/urgent-intervention-financial-notification-outputs/urgent-intervention-financial-notification-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  UrgentInterventionFinancialNotificationComponent
} from '@modules/services/urgent-intervention-financial-notification/pages/urgent-intervention-financial-notification/urgent-intervention-financial-notification.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import { AuditUrgentInterventionFinancialNotificationComponent } from './audit/audit-urgent-intervention-financial-notification/audit-urgent-intervention-financial-notification.component';


@NgModule({
  declarations: [
    UrgentInterventionFinancialNotificationComponent,
    UrgentInterventionFinancialNotificationOutputsComponent,
    AuditUrgentInterventionFinancialNotificationComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionFinancialNotificationRoutingModule
  ]
})
export class UrgentInterventionFinancialNotificationModule { }
