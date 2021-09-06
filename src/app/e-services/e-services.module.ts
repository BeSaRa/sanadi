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
import {InitialExternalOfficeApprovalComponent} from './pages/initial-external-office-approval/initial-external-office-approval.component';
import {FinalExternalOfficeApprovalComponent} from './pages/final-external-office-approval/final-external-office-approval.component';
import {SelectLicensePopupComponent} from './poups/select-license-popup/select-license-popup.component';
import {BankAccountComponent} from './shared/bank-account/bank-account.component';
import { ExecutiveManagementComponent } from './shared/executive-management/executive-management.component';
import { BankBranchComponent } from './shared/bank-branch/bank-branch.component';

@NgModule({
  declarations: [
    EServicesComponent,
    InquiryComponent,
    InquiryContainerComponent,
    ConsultationContainerComponent,
    ConsultationComponent,
    InternationalCooperationContainerComponent,
    InternationalCooperationComponent,
    InternationalCooperationComponent,
    InitialExternalOfficeApprovalComponent,
    FinalExternalOfficeApprovalComponent,
    SelectLicensePopupComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
    BankBranchComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EServicesRoutingModule
  ]
})
export class EServicesModule {
}
