import { AuditTemplatesComponent } from './audit/audit-templates/audit-templates.component';
import { AuditOrganizationOfficerComponent } from '../shared-services/audit/audit-organization-officer/audit-organization-officer.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoordinationWithOrganizationRequestRoutingModule } from './coordination-with-organization-request-routing.module';
import { CoordinationWithOrganizationRequestOutputComponent } from './pages/coordination-with-organization-request-output/coordination-with-organization-request-output.component';
import {EServicesMainModule} from '@modules/e-services-main/e-services-main.module';
import {
  CoordinationWithOrganizationsRequestComponent
} from '@modules/services/coordination-with-organization-request/pages/coordination-with-organizations-request/coordination-with-organizations-request.component';
import {
  CoordinationWithOrgPopupComponent
} from '@modules/services/coordination-with-organization-request/popups/coordination-with-org-popup/coordination-with-org-popup.component';
import {
  DynamicTemplatesComponent
} from '@modules/services/coordination-with-organization-request/shared/dynamic-templates/dynamic-templates.component';
import {
  ParticipantOrganizationsPopupComponent
} from '@modules/services/coordination-with-organization-request/popups/participant-organizations-popup/participant-organizations-popup.component';
import {
  ParticipantOrganizationComponent
} from '@modules/services/coordination-with-organization-request/shared/participant-organization/participant-organization.component';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {
  BuildingAbilityComponent
} from '@modules/services/coordination-with-organization-request/shared/building-ability/building-ability.component';
import {
  EffectiveCoordinationCapabilitiesComponent
} from '@modules/services/coordination-with-organization-request/shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import {
  OrganizationOfficerComponent
} from '@modules/services/coordination-with-organization-request/shared/organization-officer/organization-officer.component';
import {
  ResearchAndStudiesComponent
} from '@modules/services/coordination-with-organization-request/shared/research-and-studies/research-and-studies.component';
import { BuildingAbilityPopupComponent } from './shared/building-ability/building-ability-popup/building-ability-popup.component';
import { EffectiveCoordinationCapabilitiesPopupComponent } from './shared/effective-coordination-capabilities/effective-coordination-capabilities-popup/effective-coordination-capabilities-popup.component';
import { ResearchAndStudiesPopupComponent } from './shared/research-and-studies/research-and-studies-popup/research-and-studies-popup.component';
import { AuditCoordinationWithOrganizationRequestComponent } from './audit/audit-coordination-with-organization-request/audit-coordination-with-organization-request.component';
import { AuditBuildingAbilityComponent } from './audit/audit-building-ability/audit-building-ability.component';
import { AuditEffectiveCoordinationCapabilitiesComponent } from './audit/audit-effective-coordination-capabilities/audit-effective-coordination-capabilities.component';
import { AuditResearchAndStudiesComponent } from './audit/audit-research-and-studies/audit-research-and-studies.component';
import { AuditParticipantOrganizationComponent } from './audit/audit-participant-organization/audit-participant-organization.component';
import { SharedServicesModule } from '../shared-services/shared-services.module';


@NgModule({
  declarations: [
    CoordinationWithOrganizationsRequestComponent,
    CoordinationWithOrganizationRequestOutputComponent,
    CoordinationWithOrgPopupComponent,
    DynamicTemplatesComponent,
    ParticipantOrganizationsPopupComponent,
    ParticipantOrganizationComponent,
    BuildingAbilityComponent,
    BuildingAbilityPopupComponent,
    EffectiveCoordinationCapabilitiesComponent,
    EffectiveCoordinationCapabilitiesPopupComponent,
    OrganizationOfficerComponent,
    ResearchAndStudiesComponent,
    ResearchAndStudiesPopupComponent,
    AuditCoordinationWithOrganizationRequestComponent,
    AuditBuildingAbilityComponent,
    AuditEffectiveCoordinationCapabilitiesComponent,
    AuditResearchAndStudiesComponent,
    AuditParticipantOrganizationComponent,
    AuditTemplatesComponent
  ],
  imports: [
    CommonModule,
    EServicesMainModule,
    CoordinationWithOrganizationRequestRoutingModule,
    SharedServicesModule,
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
export class CoordinationWithOrganizationRequestModule { }
