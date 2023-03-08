import {SelectBankAccountPopupComponent} from './popups/select-bank-account-popup/select-bank-account-popup.component';
import {
  SelectPreRegisteredPopupComponent
} from './popups/select-pre-registered-popup/select-pre-registered-popup.component';
import {
  SelectAuthorizedEntityPopupComponent
} from './popups/select-authorized-entity-popup/select-authorized-entity-popup.component';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  SelectLicensePopupComponent
} from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  SelectTemplatePopupComponent
} from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import {
  SelectedLicenseTableComponent
} from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import {SharedModule} from '@app/shared/shared.module';
import {FormlyBootstrapModule} from '@ngx-formly/bootstrap';
import {FormlyModule} from '@ngx-formly/core';
import {WorkAreasComponent} from '../general-services/shared/work-areas/work-areas.component';
import {
  ProcessFieldWrapperComponent
} from '@app/administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import {FormlyDateFieldComponent} from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import {
  ParticipantOrganizationsPopupComponent
} from './popups/participant-organizations-popup/participant-organizations-popup.component';
import {BuildingAbilityComponent} from './shared/building-ability/building-ability.component';
import {DynamicTemplatesComponent} from './shared/dynamic-templates/dynamic-templates.component';
import {
  EffectiveCoordinationCapabilitiesComponent
} from './shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import {OrganizationOfficerComponent} from './shared/organization-officer/organization-officer.component';
import {ParticipantOrganizationComponent} from './shared/participant-organization/participant-organization.component';
import {ProjectNeedsComponent} from './shared/project-needs/project-needs.component';
import {ResearchAndStudiesComponent} from './shared/research-and-studies/research-and-studies.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    ProjectNeedsComponent,
    BuildingAbilityComponent,
    EffectiveCoordinationCapabilitiesComponent,
    DynamicTemplatesComponent,
    ParticipantOrganizationComponent,
    OrganizationOfficerComponent,
    ResearchAndStudiesComponent,
    ParticipantOrganizationsPopupComponent,
    WorkAreasComponent,
    SelectAuthorizedEntityPopupComponent,
    SelectPreRegisteredPopupComponent,
    SelectBankAccountPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
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
  ],
  exports: [
    SharedModule,
    SelectedLicenseTableComponent,
    ProjectNeedsComponent,
    BuildingAbilityComponent,
    EffectiveCoordinationCapabilitiesComponent,
    ParticipantOrganizationComponent,
    DynamicTemplatesComponent,
    OrganizationOfficerComponent,
    ResearchAndStudiesComponent,
    ParticipantOrganizationsPopupComponent,
    WorkAreasComponent,
  ]
})
export class EServicesMainModule {
}
