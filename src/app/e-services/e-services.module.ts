import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {EServicesRoutingModule} from './e-services-routing.module';
import {EServicesComponent} from './e-services.component';
import {SharedModule} from '../shared/shared.module';
import {InquiryComponent} from './pages/inquiry-container/inquiry/inquiry.component';
import {InquiryContainerComponent} from './pages/inquiry-container/inquiry-container.component';
import {ConsultationContainerComponent} from './pages/consultation-container/consultation-container.component';
import {ConsultationComponent} from './pages/consultation-container/consultation/consultation.component';
import {InternationalCooperationContainerComponent} from './pages/international-cooperation-container/international-cooperation-container.component';
import {InternationalCooperationComponent} from './pages/international-cooperation-container/international-cooperation/international-cooperation.component';
import {PartnerApprovalComponent} from './pages/partner-approval/partner-approval.component';
import {InitialExternalOfficeApprovalComponent} from './pages/initial-external-office-approval/initial-external-office-approval.component';
import {BankAccountComponent} from "@app/e-services/shared/bank-account/bank-account.component";
import {ExecutiveManagementComponent} from "@app/e-services/shared/executive-management/executive-management.component";
import {ManagementCouncilComponent} from './pages/partner-approval/management-council/management-council.component';
import {GoalComponent} from './pages/partner-approval/goal/goal.component';
import {TargetGroupComponent} from './pages/partner-approval/target-group/target-group.component';
import {ContactOfficerComponent} from './pages/partner-approval/contact-officer/contact-officer.component';
import {ApprovalReasonComponent} from './pages/partner-approval/approval-reason/approval-reason.component';
import {FinalExternalOfficeApprovalComponent} from './pages/final-external-office-approval/final-external-office-approval.component';
import {SelectLicensePopupComponent} from './poups/select-license-popup/select-license-popup.component';
import {BankBranchComponent} from './shared/bank-branch/bank-branch.component';
import {FilterInboxRequestPopupComponent} from './poups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import {ProjectsModelsComponent} from './pages/projects-models/projects-models.component';

@NgModule({
  declarations: [
    EServicesComponent,
    InquiryComponent,
    InquiryContainerComponent,
    ConsultationContainerComponent,
    ConsultationComponent,
    InternationalCooperationContainerComponent,
    InternationalCooperationComponent,
    PartnerApprovalComponent,
    InternationalCooperationComponent,
    InternationalCooperationComponent,
    InitialExternalOfficeApprovalComponent,
    FinalExternalOfficeApprovalComponent,
    SelectLicensePopupComponent,
    BankBranchComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
    ManagementCouncilComponent,
    GoalComponent,
    TargetGroupComponent,
    ContactOfficerComponent,
    ApprovalReasonComponent,
    FilterInboxRequestPopupComponent,
    ProjectsModelsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EServicesRoutingModule
  ]
})
export class EServicesModule {
}
