import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PartnerApprovalRoutingModule} from './partner-approval-routing.module';
import {PartnerApprovalOutputsComponent} from './pages/partner-approval-outputs/partner-approval-outputs.component';
import {
  PartnerApprovalComponent
} from '@modules/services/partner-approval/pages/partner-approval/partner-approval.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';
import {
  ApprovalReasonComponent
} from '@modules/services/partner-approval/shared/approval-reason/approval-reason.component';
import {
  ContactOfficerComponent
} from '@modules/services/partner-approval/shared/contact-officer/contact-officer.component';
import {GoalComponent} from '@modules/services/partner-approval/shared/goal/goal.component';
import {
  ManagementCouncilComponent
} from '@modules/services/partner-approval/shared/management-council/management-council.component';
import {TargetGroupComponent} from '@modules/services/partner-approval/shared/target-group/target-group.component';
import {
  CommercialActivityComponent
} from '@modules/services/partner-approval/shared/commercial-activity/commercial-activity.component';
import {GoalsListComponent} from '@modules/services/partner-approval/shared/goals-list/goals-list.component';
import {MapsModule} from '@modules/maps/maps.module';


@NgModule({
  declarations: [
    PartnerApprovalComponent,
    PartnerApprovalOutputsComponent,
    ApprovalReasonComponent,
    ContactOfficerComponent,
    GoalComponent,
    ManagementCouncilComponent,
    TargetGroupComponent,
    CommercialActivityComponent,
    GoalsListComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    MapsModule,
    PartnerApprovalRoutingModule
  ]
})
export class PartnerApprovalModule { }
