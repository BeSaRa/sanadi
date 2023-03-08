import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {
  CoordinationWithOrganizationsRequestComponent
} from '@app/modules/general-services/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import {
  ExternalOrgAffiliationApprovePopupComponent
} from '@app/modules/general-services/popups/external-org-affiliation-approve-popup/external-org-affiliation-approve-popup.component';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {FormlyModule} from '@ngx-formly/core';
import {NpoBankAccountComponent} from './pages/npo-management/npo-bank-account/npo-bank-account.component';
import {NpoManagementComponent} from './pages/npo-management/npo-management.component';
import {
  ForeignCountriesProjectsApprovalPopupComponent
} from './popups/foreign-countries-projects-approval-popup/foreign-countries-projects-approval-popup.component';
import {
  NpoManagementApprovePopupComponent
} from './popups/npo-management-approve-popup/npo-management-approve-popup.component';

import {EServicesMainModule} from '@app/modules/e-services-main/e-services-main.module';
import {OfficeServicesModule} from '../office-services/office-services.module';
import {GeneralServicesRoutingModule} from './general-services-routing.module';
import {GeneralServicesComponent} from './general-services.component';
import {ExternalOrgAffiliationComponent} from './pages/external-org-affiliation/external-org-affiliation.component';
import {
  ForeignCountriesProjectsComponent
} from './pages/foreign-countries-projects/foreign-countries-projects.component';
import {NpoContactOfficerComponent} from './pages/npo-management/npo-contact-officer/npo-contact-officer.component';
import {
  OrganizationsEntitiesSupportComponent
} from './pages/organizations-entities-support/organizations-entities-support.component';
import {
  CoordinationWithOrgPopupComponent
} from './popups/coordination-with-org-popup/coordination-with-org-popup.component';
import {
  OrganizationsEntitiesSupportPopupComponent
} from './popups/organizations-entities-support-popup/organizations-entities-support-popup.component';
import {FounderMembersComponent} from './pages/npo-management/founder-members/founder-members.component';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {SharedServicesModule} from '@modules/services/shared-services/shared-services.module';


@NgModule({
  declarations: [
    GeneralServicesComponent,
    ForeignCountriesProjectsApprovalPopupComponent,
    NpoContactOfficerComponent,
    ExternalOrgAffiliationComponent,
    ExternalOrgAffiliationApprovePopupComponent,
    NpoManagementApprovePopupComponent,
    ForeignCountriesProjectsComponent,
    CoordinationWithOrganizationsRequestComponent,
    NpoManagementComponent,
    FounderMembersComponent,
    NpoBankAccountComponent,
    CoordinationWithOrgPopupComponent,
    OrganizationsEntitiesSupportComponent,
    OrganizationsEntitiesSupportPopupComponent,

    OrganizationsEntitiesSupportPopupComponent,

  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    SharedServicesModule,
    GeneralServicesRoutingModule,
    OfficeServicesModule,
    FormlyBootstrapModule,
    FormlyModule.forChild({
      types: [
        {name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper']},
        {name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper']},
      ],
      wrappers: [
        {name: 'custom-wrapper', component: ProcessFieldWrapperComponent}
      ]
    }),
  ]
})
export class GeneralServicesModule {
}
