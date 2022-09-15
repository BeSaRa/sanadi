import { NpoManagementComponent } from './pages/npo-management/npo-management.component';
import { ExternalOrgAffiliationApprovePopupComponent } from '@app/modules/general-services/popups/external-org-affiliation-approve-popup/external-org-affiliation-approve-popup.component';
import { EmploymentComponent } from './pages/employment/employment.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralServicesRoutingModule } from './general-services-routing.module';
import { GeneralServicesComponent } from './general-services.component';
import { SharedModule } from '@app/shared/shared.module';
import { InquiryComponent } from '@app/modules/general-services/pages/inquiry/inquiry.component';
import { ConsultationComponent } from '@app/modules/general-services/pages/consultation/consultation.component';
import {
  InternationalCooperationComponent
} from '@app/modules/general-services/pages/international-cooperation/international-cooperation.component';
import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { EmploymentApproveComponent } from './popups/employment-approve/employment-approve.component';
import { ExternalOrgAffiliationComponent } from './pages/external-org-affiliation/external-org-affiliation.component';
import { ForeignCountriesProjectsComponent } from './pages/foreign-countries-projects/foreign-countries-projects.component';
import { ForeignCountriesProjectsPopupComponent } from './popups/foreign-countries-projects-popup/foreign-countries-projects-popup.component';
import { CoordinationWithOrganizationsRequestComponent } from './pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import { NpoContactOfficerComponent } from './pages/npo-management/npo-contact-officer/npo-contact-officer.component';
import { FounderMembersComponent } from './pages/npo-management/founder-members/founder-members.component';


@NgModule({
  declarations: [
    GeneralServicesComponent,
    InquiryComponent,
    ConsultationComponent,
    InternationalCooperationComponent,
    EmploymentApproveComponent,
    NpoContactOfficerComponent,
    ExternalOrgAffiliationComponent,
    ExternalOrgAffiliationApprovePopupComponent,
    EmploymentComponent,
    ForeignCountriesProjectsComponent,
    ForeignCountriesProjectsPopupComponent,
    CoordinationWithOrganizationsRequestComponent,
    NpoManagementComponent,
    FounderMembersComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralServicesRoutingModule,
  ]
})
export class GeneralServicesModule { }
