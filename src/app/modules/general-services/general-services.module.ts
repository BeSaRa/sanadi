import { MembersComponent } from './shared/members/members.component';
import { CharityBranchComponent } from './shared/charity-branch/charity-branch.component';
import { OrganizationOfficersComponent } from './shared/organization-officers/organization-officers.component';
import { CharityOrganizationUpdateComponent } from '@app/modules/general-services/pages/charity-organization-update/charity-organization-update.component';
import { ExternalOfficesPopupComponent } from '@app/modules/general-services/popups/external-offices-popup/external-offices-popup.component';
import { ForeignAidClassificationsComponent } from './shared/foreign-aid-classifications/foreign-aid-classifications.component';
import { BylawsComponent } from './shared/bylaws/bylaws.component';
import { CharityDecisionsComponent } from './shared/charity-decisions/charity-decisions.component';
import { NpoManagementComponent } from './pages/npo-management/npo-management.component';
import { NpoManagementApprovePopupComponent } from './popups/npo-management-approve-popup/npo-management-approve-popup.component';
import { CoordinationWithOrganizationsRequestComponent } from '@app/modules/general-services/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import { NpoBankAccountComponent } from './pages/npo-management/npo-bank-account/npo-bank-account.component';
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
import { NpoContactOfficerComponent } from './pages/npo-management/npo-contact-officer/npo-contact-officer.component';
import { FounderMembersComponent } from './pages/npo-management/founder-members/founder-members.component';
import { RealBeneficiariesComponent } from './shared/real-beneficiaries/real-beneficiaries.component';
import { OfficeServicesModule } from '../office-services/office-services.module';
import { WorkAreasComponent } from './shared/work-areas/work-areas.component';
import { CharityReportsComponent } from './shared/risk-reports/risk-reports.component';


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
    NpoManagementApprovePopupComponent,
    EmploymentComponent,
    ForeignCountriesProjectsComponent,
    ForeignCountriesProjectsPopupComponent,
    CoordinationWithOrganizationsRequestComponent,
    NpoManagementComponent,
    FounderMembersComponent,
    NpoBankAccountComponent,
    CharityOrganizationUpdateComponent,
    OrganizationOfficersComponent,
    CharityBranchComponent,
    MembersComponent,
    RealBeneficiariesComponent,
    ExternalOfficesPopupComponent,
    ForeignAidClassificationsComponent,
    WorkAreasComponent,
    BylawsComponent,
    CharityReportsComponent,
    CharityDecisionsComponent,
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralServicesRoutingModule,
    OfficeServicesModule
  ]
})
export class GeneralServicesModule { }
