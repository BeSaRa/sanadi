import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FinalExternalOfficeApprovalRoutingModule} from './final-external-office-approval-routing.module';
import {
  FinalExternalOfficeApprovalOutputsComponent
} from './pages/final-external-office-approval-outputs/final-external-office-approval-outputs.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  FinalExternalOfficeApprovalComponent
} from '@modules/services/final-external-office-approval/pages/final-external-office-approval/final-external-office-approval.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import { AuditFinalExternalOfficeApprovalComponent } from './audit/audit-final-external-office-approval/audit-final-external-office-approval.component';


@NgModule({
  declarations: [
    FinalExternalOfficeApprovalComponent,
    FinalExternalOfficeApprovalOutputsComponent,
    AuditFinalExternalOfficeApprovalComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    FinalExternalOfficeApprovalRoutingModule
  ]
})
export class FinalExternalOfficeApprovalModule { }
