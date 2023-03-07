import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {
  CharityOrganizationUpdateComponent
} from '@app/modules/general-services/pages/charity-organization-update/charity-organization-update.component';
import {
  CoordinationWithOrganizationsRequestComponent
} from '@app/modules/general-services/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import {
  ExternalOrgAffiliationApprovePopupComponent
} from '@app/modules/general-services/popups/external-org-affiliation-approve-popup/external-org-affiliation-approve-popup.component';
import { OrganizationOfficersComponent } from '@app/shared/components/organization-officers/organization-officers.component';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { EmploymentComponent } from './pages/employment/employment.component';
import { GeneralProcessNotificationComponent } from './pages/general-process-notification/general-process-notification.component';
import { NpoBankAccountComponent } from './pages/npo-management/npo-bank-account/npo-bank-account.component';
import { NpoManagementComponent } from './pages/npo-management/npo-management.component';
import {
  AwarenessActivitySuggestionApprovalComponent
} from './popups/awareness-activity-suggestion-approval/awareness-activity-suggestion-approval.component';
import { ForeignCountriesProjectsApprovalPopupComponent } from './popups/foreign-countries-projects-approval-popup/foreign-countries-projects-approval-popup.component';
import {
  GeneralProcessNotificationApprovalComponent
} from './popups/general-process-notification-approval/general-process-notification-approval.component';
import { NpoManagementApprovePopupComponent } from './popups/npo-management-approve-popup/npo-management-approve-popup.component';
import { BylawsComponent } from './shared/bylaws/bylaws.component';
import { CharityBranchComponent } from './shared/charity-branch/charity-branch.component';
import { CharityDecisionsComponent } from './shared/charity-decisions/charity-decisions.component';
import { ForeignAidClassificationsComponent } from './shared/foreign-aid-classifications/foreign-aid-classifications.component';
import { MembersComponent } from './shared/members/members.component';

import { EServicesMainModule } from '@app/modules/e-services-main/e-services-main.module';
import { OfficeServicesModule } from '../office-services/office-services.module';
import { GeneralServicesRoutingModule } from './general-services-routing.module';
import { GeneralServicesComponent } from './general-services.component';
import { ExternalOrgAffiliationComponent } from './pages/external-org-affiliation/external-org-affiliation.component';
import { ForeignCountriesProjectsComponent } from './pages/foreign-countries-projects/foreign-countries-projects.component';
import { NpoContactOfficerComponent } from './pages/npo-management/npo-contact-officer/npo-contact-officer.component';
import { OrganizationsEntitiesSupportComponent } from './pages/organizations-entities-support/organizations-entities-support.component';
import { CoordinationWithOrgPopupComponent } from './popups/coordination-with-org-popup/coordination-with-org-popup.component';
import { EmployeeFormPopupComponent } from './popups/employee-form-popup/employee-form-popup.component';
import { EmploymentApproveComponent } from './popups/employment-approve/employment-approve.component';
import { FollowupDateApprovePopupComponent } from './popups/follow-up-date-approve-popup/follow-up-date-approve-popup.component';
import { OrganizationsEntitiesSupportPopupComponent } from './popups/organizations-entities-support-popup/organizations-entities-support-popup.component';
import { EmployeesDataComponent } from './shared/employees-data/employees-data.component';
import { RealBeneficiariesComponent } from './shared/real-beneficiaries/real-beneficiaries.component';
import { CharityReportsComponent } from './shared/risk-reports/risk-reports.component';
import { AwarenessActivitySuggestionComponent } from './pages/awareness-activity-suggestion/awareness-activity-suggestion.component';
import { FounderMembersComponent } from './pages/npo-management/founder-members/founder-members.component';
import { FormlyDateFieldComponent } from '@app/services-search/components/formly-date-field/formly-date-field.component';
import { FormlyMaskInputFieldComponent } from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import { FormlySelectFieldComponent } from '@app/services-search/components/formly-select-field/formly-select-field.component';


@NgModule({
  declarations: [
    GeneralServicesComponent,
    GeneralProcessNotificationApprovalComponent,
    ForeignCountriesProjectsApprovalPopupComponent,
    EmploymentApproveComponent,
    NpoContactOfficerComponent,
    ExternalOrgAffiliationComponent,
    ExternalOrgAffiliationApprovePopupComponent,
    NpoManagementApprovePopupComponent,
    EmploymentComponent,
    ForeignCountriesProjectsComponent,
    FollowupDateApprovePopupComponent,
    CoordinationWithOrganizationsRequestComponent,
    EmployeeFormPopupComponent,
    NpoManagementComponent,
    GeneralProcessNotificationComponent,
    FounderMembersComponent,
    EmployeesDataComponent,
    NpoBankAccountComponent,
    CharityOrganizationUpdateComponent,
    OrganizationOfficersComponent,
    CharityBranchComponent,
    MembersComponent,
    RealBeneficiariesComponent,
    ForeignAidClassificationsComponent,
    BylawsComponent,
    CharityReportsComponent,
    CharityDecisionsComponent,
    CoordinationWithOrgPopupComponent,
    AwarenessActivitySuggestionComponent,
    AwarenessActivitySuggestionApprovalComponent,
    OrganizationsEntitiesSupportComponent,
    OrganizationsEntitiesSupportPopupComponent,

    OrganizationsEntitiesSupportPopupComponent,

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    GeneralServicesRoutingModule,
    OfficeServicesModule,
    FormlyBootstrapModule,
    FormlyModule.forChild({
      types: [
        { name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper'] },
        { name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper'] },
      ],
      wrappers: [
        { name: 'custom-wrapper', component: ProcessFieldWrapperComponent }
      ]
    }),
  ]
})
export class GeneralServicesModule { }
