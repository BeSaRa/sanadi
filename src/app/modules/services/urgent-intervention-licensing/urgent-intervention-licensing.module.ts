import { AuditUrgentInterventionLicenseComponent } from './audit/audit-urgent-intervention-license/audit-urgent-intervention-license.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UrgentInterventionLicensingRoutingModule} from './urgent-intervention-licensing-routing.module';
import {
  UrgentInterventionLicensingOutputsComponent
} from './pages/urgent-intervention-licensing-outputs/urgent-intervention-licensing-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  UrgentInterventionLicenseComponent
} from '@modules/services/urgent-intervention-licensing/pages/urgent-intervention-license/urgent-intervention-license.component';
import {
  UrgentInterventionApproveTaskPopupComponent
} from '@modules/services/urgent-intervention-licensing/popups/urgent-intervention-approve-task-popup/urgent-intervention-approve-task-popup.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    UrgentInterventionLicenseComponent,
    UrgentInterventionLicensingOutputsComponent,
    UrgentInterventionApproveTaskPopupComponent,
    AuditUrgentInterventionLicenseComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    UrgentInterventionLicensingRoutingModule
  ]
})
export class UrgentInterventionLicensingModule { }
