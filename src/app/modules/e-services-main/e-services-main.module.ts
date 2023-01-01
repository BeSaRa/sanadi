import { ApproveWithDocumentPopupComponent } from './popups/approve-with-document-popup/approve-with-document-popup.component';
import { ProcessFieldWrapperComponent } from './../../administration/popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import { FormlyMaskInputFieldComponent } from './../../services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import { FormlySelectFieldComponent } from './../../services-search/components/formly-select-field/formly-select-field.component';
import { FormlyDateFieldComponent } from './../../services-search/components/formly-date-field/formly-date-field.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import { SelectLicensePopupComponent } from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import {
  FilterInboxRequestPopupComponent
} from '@app/modules/e-services-main/popups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import { SelectTemplatePopupComponent } from '@app/modules/e-services-main/popups/select-template-popup/select-template-popup.component';
import { SelectedLicenseTableComponent } from '@app/modules/e-services-main/shared/selected-license-table/selected-license-table.component';
import { BankAccountComponent } from './shared/bank-account/bank-account.component';
import { ProjectNeedsComponent } from './shared/project-needs/project-needs.component';
import { BuildingAbilityComponent } from './shared/building-ability/building-ability.component';
import { EffectiveCoordinationCapabilitiesComponent } from './shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import { ParticipantOrganizationComponent } from './shared/participant-organization/participant-organization.component';
import { OrganizationOfficerComponent } from './shared/organization-officer/organization-officer.component';
import { ResearchAndStudiesComponent } from './shared/research-and-studies/research-and-studies.component';
import { ParticipantOrganizationsPopupComponent } from './popups/participant-organizations-popup/participant-organizations-popup.component';
import { WorkAreasComponent } from '../general-services/shared/work-areas/work-areas.component';
import { DynamicTemplatesComponent } from './shared/dynamic-templates/dynamic-templates.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    FilterInboxRequestPopupComponent,
    SelectedLicenseTableComponent,
    SelectedLicenseTableComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ProjectNeedsComponent,
    BuildingAbilityComponent,
    EffectiveCoordinationCapabilitiesComponent,
    DynamicTemplatesComponent,
    ParticipantOrganizationComponent,
    OrganizationOfficerComponent,
    ResearchAndStudiesComponent,
    ParticipantOrganizationsPopupComponent,
    WorkAreasComponent,
    ApproveWithDocumentPopupComponent
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
    BankAccountComponent,
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
