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
import { CommercialActivityPopupComponent } from './shared/commercial-activity/commercial-activity-popup/commercial-activity-popup.component';
import { GoalsListPopupComponent } from './shared/goals-list/goals-list-popup/goals-list-popup.component';
import { GoalPopupComponent } from './shared/goal/goal-popup/goal-popup.component';
import { TargetGroupPopupComponent } from './shared/target-group/target-group-popup/target-group-popup.component';
import { ManagementCouncilPopupComponent } from './shared/management-council/management-council-popup/management-council-popup.component';
import { ApprovalReasonPopupComponent } from './shared/approval-reason/approval-reason-popup/approval-reason-popup.component';
import {AuditPartnerApprovalComponent} from './audit/audit-partner-approval/audit-partner-approval.component';
import {AuditGoalsComponent} from './audit/audit-goals/audit-goals.component';
import {AuditGoalsListComponent} from './audit/audit-goals-list/audit-goals-list.component';
import {AuditTargetGroupComponent} from './audit/audit-target-group/audit-target-group.component';
import { AuditManagementCouncilComponent } from './audit/audit-management-council/audit-management-council.component';
import { AuditApprovalReasonsComponent } from './audit/audit-approval-reasons/audit-approval-reasons.component';
import { AuditCommercialActivityComponent } from './audit/audit-commercial-activity/audit-commercial-activity.component';


@NgModule({
  declarations: [
    PartnerApprovalComponent,
    PartnerApprovalOutputsComponent,
    ApprovalReasonComponent,
    ApprovalReasonPopupComponent,
    ContactOfficerComponent,
    GoalComponent,
    GoalPopupComponent,
    ManagementCouncilComponent,
    ManagementCouncilPopupComponent,
    TargetGroupComponent,
    TargetGroupPopupComponent,
    CommercialActivityComponent,
    CommercialActivityPopupComponent,
    GoalsListComponent,
    GoalsListPopupComponent,
    AuditPartnerApprovalComponent,
    AuditGoalsComponent,
    AuditGoalsListComponent,
    AuditTargetGroupComponent,
    AuditManagementCouncilComponent,
    AuditApprovalReasonsComponent,
    AuditCommercialActivityComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    MapsModule,
    PartnerApprovalRoutingModule
  ]
})
export class PartnerApprovalModule {
}
