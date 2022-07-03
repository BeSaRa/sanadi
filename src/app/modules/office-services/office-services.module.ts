import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OfficeServicesRoutingModule} from './office-services-routing.module';
import {OfficeServicesComponent} from './office-services.component';
import {
  InitialExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/initial-external-office-approval/initial-external-office-approval.component';
import {PartnerApprovalComponent} from '@app/modules/office-services/pages/partner-approval/partner-approval.component';
import {
  FinalExternalOfficeApprovalComponent
} from '@app/modules/office-services/pages/final-external-office-approval/final-external-office-approval.component';
import {BankAccountComponent} from '@app/modules/office-services/shared/bank-account/bank-account.component';
import {BankBranchComponent} from '@app/modules/office-services/shared/bank-branch/bank-branch.component';
import {ExecutiveManagementComponent} from '@app/modules/office-services/shared/executive-management/executive-management.component';
import {ApprovalReasonComponent} from '@app/modules/office-services/pages/partner-approval/approval-reason/approval-reason.component';
import {ContactOfficerComponent} from '@app/modules/office-services/pages/partner-approval/contact-officer/contact-officer.component';
import {GoalComponent} from '@app/modules/office-services/pages/partner-approval/goal/goal.component';
import {
  ManagementCouncilComponent
} from '@app/modules/office-services/pages/partner-approval/management-council/management-council.component';
import {TargetGroupComponent} from '@app/modules/office-services/pages/partner-approval/target-group/target-group.component';
import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import { ExternalOrgAffiliationComponent } from './pages/external-org-affiliation/external-org-affiliation.component';


@NgModule({
  declarations: [
    OfficeServicesComponent,
    InitialExternalOfficeApprovalComponent,
    PartnerApprovalComponent,
    FinalExternalOfficeApprovalComponent,
    BankAccountComponent,
    BankBranchComponent,
    ExecutiveManagementComponent,
    ApprovalReasonComponent,
    ContactOfficerComponent,
    GoalComponent,
    ManagementCouncilComponent,
    TargetGroupComponent,
    ExternalOrgAffiliationComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    OfficeServicesRoutingModule
  ]
})
export class OfficeServicesModule { }
