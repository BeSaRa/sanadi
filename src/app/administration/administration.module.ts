import { FormlyFieldHulfGridWrapperComponent } from './../services-search/components/formly-field-hulf-grid-wrapper/formly-field-hulf-grid-wrapper.component';
import { FormlyMaskInputFieldComponent } from './../services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import { FormlySelectFieldComponent } from './../services-search/components/formly-select-field/formly-select-field.component';
import { FormlyDateFieldComponent } from './../services-search/components/formly-date-field/formly-date-field.component';
import { GeneralProcessPopupComponent } from './popups/general-process-popup/general-process-popup.component';
import { GeneralProcessComponent } from './pages/general-process/general-process.component';
import { CustomMenuPopupComponent } from './popups/custom-menu-popup/custom-menu-popup.component';
import { CustomMenuComponent } from './pages/custom-menu/custom-menu.component';
import { OrganizationUnitFieldPopupComponent } from './popups/organization-unit-field-popup/organization-unit-field-popup.component';
import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { SharedModule } from '../shared/shared.module';
import { LocalizationComponent } from './pages/localization/localization.component';
import { CustomRoleComponent } from './pages/custom-role/custom-role.component';
import { CustomRolePopupComponent } from './popups/custom-role-popup/custom-role-popup.component';
import { AidLookupComponent } from './pages/aid-lookup/aid-lookup.component';
import { AidLookupPopupComponent } from './popups/aid-lookup-popup/aid-lookup-popup.component';
import { AidLookupContainerComponent } from './pages/aid-lookup-container/aid-lookup-container.component';
import { OrganizationUnitComponent } from './pages/organization-unit/organization-unit.component';
import { OrganizationUnitPopupComponent } from './popups/organization-unit-popup/organization-unit-popup.component';
import { OrganizationBranchPopupComponent, } from './popups/organization-branch-popup/organization-branch-popup.component';
import { OrganizationBranchComponent } from './pages/organization-branch/organization-branch.component';
import { OrganizationUserComponent } from './pages/organization-user/organization-user.component';
import { OrganizationUserPopupComponent } from './popups/organization-user-popup/organization-user-popup.component';
import { OrganizationBranchUserComponent } from './pages/organization-branch-user/organization-branch-user.component';
import { AuditLogPopupComponent } from './popups/audit-log-popup/audit-log-popup.component';
import { AttachmentTypesComponent } from './pages/attachment-types/attachment-types.component';
import { AttachmentTypesPopupComponent } from './popups/attachment-types-popup/attachment-types-popup.component';
import { ServiceDataComponent } from './pages/service-data/service-data.component';
import { ServiceDataPopupComponent } from './popups/service-data-popup/service-data-popup.component';
import { TeamComponent } from './pages/team/team.component';
import { TeamPopupComponent } from './popups/team-popup/team-popup.component';
import { CountryComponent } from './pages/country/country.component';
import { CountryPopupComponent } from './popups/country-popup/country-popup.component';
import { ChangeCountryParentPopupComponent, } from './popups/change-country-parent-popup/change-country-parent-popup.component';
import {
  AttachmentTypeServiceDataPopupComponent,
} from './popups/attachment-type-service-data-popup/attachment-type-service-data-popup.component';
import { InternalUserComponent } from './pages/internal-user/internal-user.component';
import { InternalUserPopupComponent } from './popups/internal-user-popup/internal-user-popup.component';
import { InternalDepartmentComponent } from './pages/internal-department/internal-department.component';
import { InternalDepartmentPopupComponent, } from './popups/internal-department-popup/internal-department-popup.component';
import { JobTitleComponent } from './pages/job-title/job-title.component';
import { JobTitlePopupComponent } from './popups/job-title-popup/job-title-popup.component';
import { UserTeamComponent } from './shared/user-team/user-team.component';
import { UserSecurityComponent } from './shared/user-security/user-security.component';
import { SurveyQuestionComponent } from './pages/survey-question/survey-question.component';
import { SurveyQuestionPopupComponent } from './popups/survey-question-popup/survey-question-popup.component';
import { SurveyTemplateComponent } from '@app/administration/pages/survey-template/survey-template.component';
import { SurveyTemplatePopupComponent } from './popups/survey-template-popup/survey-template-popup.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SurveySectionPopupComponent } from './popups/survey-section-popup/survey-section-popup.component';
import { SelectQuestionPopupComponent } from './popups/select-question-popup/select-question-popup.component';
import { SdGoalComponent } from './pages/sd-goal/sd-goal.component';
import { SdGoalPopupComponent } from './popups/sd-goal-popup/sd-goal-popup.component';
import { ServiceDataStepPopupComponent } from './popups/service-data-step-popup/service-data-step-popup.component';
import { ChecklistPopupComponent } from './popups/checklist-popup/checklist-popup.component';
import { ChecklistItemPopupComponent } from './popups/checklist-item-popup/checklist-item-popup.component';
import { OrgUnitFieldPopupComponent } from './popups/org-unit-field-popup/org-unit-field-popup.component';
import { OrganizationUnitServicesComponent } from './shared/organization-unit-services/organization-unit-services.component';
import { BankComponent } from './pages/bank/bank.component';
import { BankPopupComponent } from './popups/bank-popup/bank-popup.component';
import { DonorComponent } from './pages/donor/donor.component';
import { DonorPopupComponent } from './popups/donor-popup/donor-popup.component';
import { FollowupConfigurationComponent } from './pages/followup-configuration/followup-configuration.component';
import { FollowupConfigurationPopupComponent } from './popups/followup-configuration-popup/followup-configuration-popup.component';
import { UserFollowupPermissionComponent } from './shared/user-followup-permission/user-followup-permission.component';
import { FieldAssessmentPopupComponent } from './popups/field-assessment-popup/field-assessment-popup.component';
import { FieldAssessmentComponent } from './pages/field-assessment/field-assessment.component';
import { OrganizationUnitFieldComponent } from './pages/organization-unit-field/organization-unit-field.component';
import { AdminLookupPopupComponent } from './popups/admin-lookup-popup/admin-lookup-popup.component';
import { DacOchaNewPopupComponent } from './popups/dac-ocha-new-popup/dac-ocha-new-popup.component';
import { VactionDatesComponent } from './pages/vaction-dates/vaction-dates.component';
import { VacationDatesPopupComponent } from './popups/vacation-dates-popup/vacation-dates-popup.component';
import { DacOchaListComponent } from './pages/dac-ocha-list/dac-ocha-list.component';
import { AdminLookupOldComponent } from './pages/admin-lookup-old/admin-lookup-old.component';
import { ActivityTypeComponent } from './pages/activity-types/activity-types.component';
import { ActivityTypesPopupComponent } from './popups/activity-types-popup/activity-types-popup.component';
import { AdminLookupListComponent } from './pages/admin-lookup-list/admin-lookup-list.component';
import { AdminLookupComponent } from './pages/admin-lookup/admin-lookup.component';
import { ProfilePopupComponent } from './popups/profile-popup/profile-popup.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { SubTeamPopupComponent } from './popups/sub-team-popup/sub-team-popup.component';
import { SubTeamComponent } from './pages/sub-team/sub-team.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

@NgModule({
  declarations: [
    AdminHomeComponent,
    LocalizationComponent,
    CustomRoleComponent,
    CustomRolePopupComponent,
    AidLookupComponent,
    AidLookupPopupComponent,
    AidLookupContainerComponent,
    OrganizationUnitComponent,
    OrganizationUnitPopupComponent,
    OrganizationBranchPopupComponent,
    OrganizationBranchComponent,
    OrganizationUserComponent,
    OrganizationUserPopupComponent,
    OrganizationBranchUserComponent,
    AuditLogPopupComponent,
    AttachmentTypesComponent,
    AttachmentTypesPopupComponent,
    TeamComponent,
    TeamPopupComponent,
    ServiceDataComponent,
    ServiceDataPopupComponent,
    CountryComponent,
    CountryPopupComponent,
    ChangeCountryParentPopupComponent,
    AttachmentTypeServiceDataPopupComponent,
    InternalUserComponent,
    InternalUserPopupComponent,
    InternalDepartmentComponent,
    InternalDepartmentPopupComponent,
    JobTitleComponent,
    JobTitlePopupComponent,
    GeneralProcessComponent,
    GeneralProcessPopupComponent,
    SubTeamComponent,
    SubTeamPopupComponent,
    UserTeamComponent,
    UserSecurityComponent,
    SurveyQuestionComponent,
    SurveyQuestionPopupComponent,
    SurveyTemplateComponent,
    SurveyTemplatePopupComponent,
    SurveySectionPopupComponent,
    SelectQuestionPopupComponent,
    SdGoalComponent,
    SdGoalPopupComponent,
    ServiceDataStepPopupComponent,
    ChecklistPopupComponent,
    ChecklistItemPopupComponent,
    OrgUnitFieldPopupComponent,
    OrganizationUnitServicesComponent,
    BankComponent,
    BankPopupComponent,
    DonorComponent,
    DonorPopupComponent,
    FollowupConfigurationComponent,
    FollowupConfigurationPopupComponent,
    UserFollowupPermissionComponent,
    FieldAssessmentPopupComponent,
    FieldAssessmentComponent,
    OrganizationUnitFieldPopupComponent,
    OrganizationUnitFieldComponent,
    AdminLookupPopupComponent,
    DacOchaNewPopupComponent,
    VactionDatesComponent,
    VacationDatesPopupComponent,
    DacOchaListComponent,
    AdminLookupOldComponent,
    ActivityTypeComponent,
    ActivityTypesPopupComponent,
    AdminLookupListComponent,
    AdminLookupComponent,
    CustomMenuComponent,
    CustomMenuPopupComponent,
    ProfilePopupComponent,
    ProfilesComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    DragDropModule,
    FormlyModule.forChild({
      types: [
        { name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['col-md-6'] },
        { name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['col-md-6'] },
        { name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['col-md-6'] },
      ],
      wrappers: [
        { name: 'col-md-6', component: FormlyFieldHulfGridWrapperComponent }
      ]
    }),
    FormlyBootstrapModule
  ],
})
export class AdministrationModule {
}
