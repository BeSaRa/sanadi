import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import {
  FinalExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/final-external-office-approval/final-external-office-approval.component';
import {
  InitialExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/initial-external-office-approval/initial-external-office-approval.component';
import { PartnerApprovalComponent } from '@app/modules/office-services/pages/partner-approval/partner-approval.component';
import { ApprovalReasonComponent } from '@app/modules/office-services/shared/approval-reason/approval-reason.component';
import { BankBranchComponent } from '@app/modules/office-services/shared/bank-branch/bank-branch.component';
import { ContactOfficerComponent } from '@app/modules/office-services/shared/contact-officer/contact-officer.component';
import { GoalComponent } from '@app/modules/office-services/shared/goal/goal.component';
import {
  ManagementCouncilComponent
} from '@app/modules/office-services/shared/management-council/management-council.component';
import { TargetGroupComponent } from '@app/modules/office-services/shared/target-group/target-group.component';
import { MapsModule } from '../maps/maps.module';
import { OfficeServicesRoutingModule } from './office-services-routing.module';
import { OfficeServicesComponent } from './office-services.component';
import { CommercialActivityComponent } from './shared/commercial-activity/commercial-activity.component';


@NgModule({
  declarations: [
    OfficeServicesComponent,
    InitialExternalOfficeApprovalComponent,
    PartnerApprovalComponent,
    FinalExternalOfficeApprovalComponent,
    BankBranchComponent,
    ApprovalReasonComponent,
    ContactOfficerComponent,
    GoalComponent,
    ManagementCouncilComponent,
    TargetGroupComponent,
    CommercialActivityComponent,

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    OfficeServicesRoutingModule,
    MapsModule
  ],
  exports: [BankBranchComponent]
})
export class OfficeServicesModule { }
