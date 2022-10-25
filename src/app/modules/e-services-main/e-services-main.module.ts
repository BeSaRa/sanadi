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
import { ExecutiveManagementComponent } from './shared/executive-management/executive-management.component';
import { EmployeeFormPopupComponent } from '@app/modules/e-services-main/popups/employee-form-popup/employee-form-popup.component';
import { EmployeesDataComponent } from './shared/employees-data/employees-data.component';
import { ProjectNeedsComponent } from './shared/project-needs/project-needs.component';
import { BuildingAbilityComponent } from './shared/building-ability/building-ability.component';
import { EffectiveCoordinationCapabilitiesComponent } from './shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import { ParticipantOrganizationComponent } from './shared/participant-organization/participant-organization.component';
import { OrganizaionOfficerComponent } from './shared/organizaion-officer/organizaion-officer.component';
import { ResearchAndStudiesComponent } from './shared/research-and-studies/research-and-studies.component';
import { ParticipantOrganizationsPopupComponent } from './popups/participant-organizations-popup/participant-organizations-popup.component';
import { WorkAreasComponent } from '../general-services/shared/work-areas/work-areas.component';

@NgModule({
  declarations: [
    SelectLicensePopupComponent,
    FilterInboxRequestPopupComponent,
    SelectedLicenseTableComponent,
    SelectedLicenseTableComponent,
    SelectTemplatePopupComponent,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
    EmployeesDataComponent,
    EmployeeFormPopupComponent,
    ProjectNeedsComponent,
    BuildingAbilityComponent,
    EffectiveCoordinationCapabilitiesComponent,
    ParticipantOrganizationComponent,
    OrganizaionOfficerComponent,
    ResearchAndStudiesComponent,
    ParticipantOrganizationsPopupComponent,
    WorkAreasComponent,

  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SharedModule,
    SelectedLicenseTableComponent,
    BankAccountComponent,
    ExecutiveManagementComponent,
    EmployeeFormPopupComponent,
    EmployeesDataComponent,
    ProjectNeedsComponent,
    BuildingAbilityComponent,
    EffectiveCoordinationCapabilitiesComponent,
    ParticipantOrganizationComponent,
    OrganizaionOfficerComponent,
    ResearchAndStudiesComponent,
    ParticipantOrganizationsPopupComponent,
    WorkAreasComponent,

  ]
})
export class EServicesMainModule {
}
