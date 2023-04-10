import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InitialExternalOfficeApprovalRoutingModule} from './initial-external-office-approval-routing.module';
import {
  InitialExternalOfficeApprovalOutputsComponent
} from './pages/initial-external-office-approval-outputs/initial-external-office-approval-outputs.component';
import {
  InitialExternalOfficeApprovalComponent
} from '@modules/services/initial-external-office-approval/pages/initial-external-office-approval/initial-external-office-approval.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';


@NgModule({
  declarations: [
    InitialExternalOfficeApprovalComponent,
    InitialExternalOfficeApprovalOutputsComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    InitialExternalOfficeApprovalRoutingModule
  ]
})
export class InitialExternalOfficeApprovalModule { }
