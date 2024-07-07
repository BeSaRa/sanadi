import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { AdminPermissionComponent } from '@app/administration/pages/admin-permission/admin-permission.component';
import { NpoEmployeeComponent } from '@app/administration/pages/npo-employee/npo-employee.component';
import { SurveyTemplateComponent } from '@app/administration/pages/survey-template/survey-template.component';
import { TrainingProgramClassificationComponent } from '@app/administration/pages/training-program-classification/training-program-classification.component';
import { VacationDatesComponent } from '@app/administration/pages/vacation-dates/vacation-dates.component';
import { AdminPermissionPopupComponent } from '@app/administration/popups/admin-permission-popup/admin-permission-popup.component';
import {
  ExternalUserUpdateApprovalPopupComponent
} from '@app/administration/popups/external-user-update-approval-popup/external-user-update-approval-popup.component';
import { ServiceDataCustomTemplatePopupComponent } from '@app/administration/popups/service-data-custom-template-popup/service-data-custom-template-popup.component';
import { TrainingProgramAudiencePopupComponent } from '@app/administration/popups/training-program-audience-popup/training-program-audience-popup.component';
import { TrainingProgramClassificationPopupComponent } from '@app/administration/popups/training-program-classification-popup/training-program-classification-popup.component';
import {
  TrainingProgramPartnerPopupComponent
} from '@app/administration/popups/training-program-partner-popup/training-program-partner-popup.component';
import { ServiceDataCustomTemplatesComponent } from '@app/administration/shared/service-data-custom-templates/service-data-custom-templates.component';
import {
  UserPermissionExternalComponent
} from "@app/administration/shared/user-permission-external/user-permission-external.component";
import { UserPermissionInternalComponent } from '@app/administration/shared/user-permission-internal/user-permission-internal.component';
import { FormlyDateFieldComponent } from '@app/services-search/components/formly-date-field/formly-date-field.component';
import {
  FormlyFieldFullWrapperComponent
} from '@app/services-search/components/formly-field-full-wrapper/formly-field-full-wrapper.component';
import {
  FormlyFieldWrapperComponent
} from '@app/services-search/components/formly-field-wrapper/formly-field-wrapper.component';
import {
  FormlyMaskInputFieldComponent
} from '@app/services-search/components/formly-mask-input-field/formly-mask-input-field.component';
import {
  FormlySelectFieldComponent
} from '@app/services-search/components/formly-select-field/formly-select-field.component';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { AdminLicenseComponent } from './pages/admin-license/admin-license.component';
import { AdminLookupListComponent } from './pages/admin-lookup-list/admin-lookup-list.component';
import { AdminLookupComponent } from './pages/admin-lookup/admin-lookup.component';
import { AidLookupContainerComponent } from './pages/aid-lookup-container/aid-lookup-container.component';
import { AidLookupComponent } from './pages/aid-lookup/aid-lookup.component';
import { AttachmentTypesComponent } from './pages/attachment-types/attachment-types.component';
import { BankComponent } from './pages/bank/bank.component';
import { CharityProfileComponent } from './pages/charity-profile/charity-profile.component';
import { CountryComponent } from './pages/country/country.component';
import { CustomMenuComponent } from './pages/custom-menu/custom-menu.component';
import { CustomRoleComponent } from './pages/custom-role/custom-role.component';
import { DeductionRatioComponent } from './pages/deduction-ratio/deduction-ratio.component';
import { DonorComponent } from './pages/donor/donor.component';
import { DynamicModelsComponent } from './pages/dynamic-models/dynamic-models.component';
import {
  ExternalUserUpdateRequestApprovalComponent
} from './pages/external-user-update-approval/external-user-update-request-approval.component';
import { ExternalUserComponent } from './pages/external-user/external-user.component';
import { FieldAssessmentComponent } from './pages/field-assessment/field-assessment.component';
import { GeneralProcessComponent } from './pages/general-process/general-process.component';
import { GlobalSettingsComponent } from './pages/global-settings/global-settings.component';
import { InspectionOperationComponent } from './pages/inspection-operation/inspection-operation.component';
import { InternalDepartmentComponent } from './pages/internal-department/internal-department.component';
import { InternalUserComponent } from './pages/internal-user/internal-user.component';
import { JobTitleComponent } from './pages/job-title/job-title.component';
import { LocalizationComponent } from './pages/localization/localization.component';
import { NpoProfileComponent } from './pages/npo-profile/npo-profile.component';
import { ProfilesComponent } from './pages/profiles/profiles.component';
import { SdGoalListComponent } from './pages/sd-goal-list/sd-goal-list.component';
import { SdGoalComponent } from './pages/sd-goal/sd-goal.component';
import { SectorComponent } from './pages/sector/sector.component';
import {
  ServiceDataFollowupConfigurationComponent
} from './pages/service-data-followup-configuration/service-data-followup-configuration.component';
import { ServiceDataComponent } from './pages/service-data/service-data.component';
import { SubTeamComponent } from './pages/sub-team/sub-team.component';
import { SurveyQuestionComponent } from './pages/survey-question/survey-question.component';
import { TeamComponent } from './pages/team/team.component';
import { TrainingProgramAudienceComponent } from './pages/training-program-audience/training-program-audience.component';
import { TrainingProgramPartnerComponent } from './pages/training-program-partner/training-program-partner.component';
import { AdminLookupPopupComponent } from './popups/admin-lookup-popup/admin-lookup-popup.component';
import { AidLookupPopupComponent } from './popups/aid-lookup-popup/aid-lookup-popup.component';
import {
  AttachmentTypeServiceDataPopupComponent,
} from './popups/attachment-type-service-data-popup/attachment-type-service-data-popup.component';
import { AttachmentTypesPopupComponent } from './popups/attachment-types-popup/attachment-types-popup.component';
import { AdminAuditLogPopupComponent } from './popups/audit-log-popup/admin-audit-log-popup.component';
import { BankPopupComponent } from './popups/bank-popup/bank-popup.component';
import {
  ChangeCountryParentPopupComponent,
} from './popups/change-country-parent-popup/change-country-parent-popup.component';
import {
  CharityOrganizationProfileExtraDataPopupComponent
} from './popups/charity-organization-profile-extra-data-popup/charity-organization-profile-extra-data-popup.component';
import { CharityProfilePopupComponent } from './popups/charity-profile-popup/charity-profile-popup.component';
import { ChecklistItemPopupComponent } from './popups/checklist-item-popup/checklist-item-popup.component';
import { ChecklistPopupComponent } from './popups/checklist-popup/checklist-popup.component';
import { CustomMenuDefaultsPopupComponent } from './popups/custom-menu-defaults-popup/custom-menu-defaults-popup.component';
import { CustomMenuPopupComponent } from './popups/custom-menu-popup/custom-menu-popup.component';
import { CustomRolePopupComponent } from './popups/custom-role-popup/custom-role-popup.component';
import { CustomServiceTemplatePopupComponent } from './popups/custom-service-template-popup/custom-service-template-popup.component';
import { DacOchaNewPopupComponent } from './popups/dac-ocha-new-popup/dac-ocha-new-popup.component';
import { DeductionRatioPopupComponent } from './popups/deduction-ratio-popup/deduction-ratio-popup.component';
import { DonorPopupComponent } from './popups/donor-popup/donor-popup.component';
import { DynamicModelPopupComponent } from './popups/dynamic-model-popup/dynamic-model-popup.component';
import { ExternalUserPopupComponent } from './popups/external-user-popup/external-user-popup.component';
import {
  ExternalUserUpdateChangesPopupComponent
} from './popups/external-user-update-changes-popup/external-user-update-changes-popup.component';
import { FieldAssessmentPopupComponent } from './popups/field-assessment-popup/field-assessment-popup.component';
import { GeneralProcessPopupComponent } from './popups/general-process-popup/general-process-popup.component';
import {
  ProcessFieldWrapperComponent
} from './popups/general-process-popup/process-formly-components/process-field-wrapper/process-field-wrapper.component';
import { InspectionOperationChildrenPopupComponent } from './popups/inspection-operation-children-popup/inspection-operation-children-popup.component';
import { InspectionOperationPopupComponent } from './popups/inspection-operation-popup/inspection-operation-popup.component';
import {
  InternalDepartmentPopupComponent,
} from './popups/internal-department-popup/internal-department-popup.component';
import { InternalUserPopupComponent } from './popups/internal-user-popup/internal-user-popup.component';
import { JobTitlePopupComponent } from './popups/job-title-popup/job-title-popup.component';
import { NpoEmployeePopupComponent } from './popups/npo-employee-popup/npo-employee-popup.component';
import { NpoProfilePopupComponent } from './popups/npo-profile-popup/npo-profile-popup.component';
import { OrgUnitFieldPopupComponent } from './popups/org-unit-field-popup/org-unit-field-popup.component';
import { ProfilePopupComponent } from './popups/profile-popup/profile-popup.component';
import { SdGoalPopupComponent } from './popups/sd-goal-popup/sd-goal-popup.component';
import { SectorPopupComponent } from './popups/sector-popup/sector-popup.component';
import { SelectQuestionPopupComponent } from './popups/select-question-popup/select-question-popup.component';
import {
  ServiceDataFollowupConfigurationPopupComponent
} from './popups/service-data-followup-configuration-popup/service-data-followup-configuration-popup.component';
import { ServiceDataPopupComponent } from './popups/service-data-popup/service-data-popup.component';
import { ServiceDataStepPopupComponent } from './popups/service-data-step-popup/service-data-step-popup.component';
import { SubTeamPopupComponent } from './popups/sub-team-popup/sub-team-popup.component';
import { SurveyQuestionPopupComponent } from './popups/survey-question-popup/survey-question-popup.component';
import { SurveySectionPopupComponent } from './popups/survey-section-popup/survey-section-popup.component';
import { SurveyTemplatePopupComponent } from './popups/survey-template-popup/survey-template-popup.component';
import { TeamPopupComponent } from './popups/team-popup/team-popup.component';
import { VacationDatesPopupComponent } from './popups/vacation-dates-popup/vacation-dates-popup.component';
import { VerificationTemplatePopupComponent } from './popups/verification-template-popup/verification-template-popup.component';
import { BranchOfficersPopupComponent } from './shared/branch-officers-popup/branch-officers-popup.component';
import { CustomMenuPermissionComponent } from './shared/custom-menu-permission/custom-menu-permission.component';
import { CustomMenuUrlHandlerComponent } from './shared/custom-menu-url-handler/custom-menu-url-handler.component';
import { CustomServiceTemplateComponent } from './shared/custom-service-template/custom-service-template.component';
import { FieldAssessmentServiceLinkComponent } from './shared/field-assessment-service-link/field-assessment-service-link.component';
import { ProfileAttachmentsComponent } from './shared/profile-attachments/profile-attachments.component';
import { ProfileBranchesComponent } from './shared/profile-branches/profile-branches.component';
import { ProfileOfficersComponent } from './shared/profile-officers/profile-officers.component';
import {
  UserFollowupPermissionNewComponent
} from './shared/user-followup-permission-new/user-followup-permission-new.component';
import { UserFollowupPermissionComponent } from './shared/user-followup-permission/user-followup-permission.component';
import { UserSecurityExternalComponent } from './shared/user-security-external/user-security-external.component';
import { UserSecurityComponent } from './shared/user-security/user-security.component';
import { UserSubTeamComponent } from './shared/user-sub-team/user-sub-team.component';
import { UserTeamComponent } from './shared/user-team/user-team.component';
import { VerificationTemplatesComponent } from './shared/verification-templates/verification-templates.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@NgModule({
  declarations: [
    AdminHomeComponent,
    LocalizationComponent,
    CustomRoleComponent,
    CustomRolePopupComponent,
    AidLookupComponent,
    AidLookupPopupComponent,
    AidLookupContainerComponent,
    ExternalUserComponent,
    ExternalUserPopupComponent,
    AdminAuditLogPopupComponent,
    AttachmentTypesComponent,
    AttachmentTypesPopupComponent,
    TeamComponent,
    TeamPopupComponent,
    ServiceDataComponent,
    ServiceDataPopupComponent,
    CustomServiceTemplateComponent,
    CustomServiceTemplatePopupComponent,
    CountryComponent,
    ChangeCountryParentPopupComponent,
    AttachmentTypeServiceDataPopupComponent,
    InternalUserComponent,
    InternalUserPopupComponent,
    InternalDepartmentComponent,
    InternalDepartmentPopupComponent,
    JobTitleComponent,
    JobTitlePopupComponent,
    TrainingProgramPartnerComponent,
    TrainingProgramPartnerPopupComponent,
    TrainingProgramAudienceComponent,
    TrainingProgramAudiencePopupComponent,
    GeneralProcessComponent,
    GeneralProcessPopupComponent,
    SubTeamComponent,
    SubTeamPopupComponent,
    UserTeamComponent,
    UserSubTeamComponent,
    UserSecurityComponent,
    SurveyQuestionComponent,
    SurveyQuestionPopupComponent,
    SurveyTemplateComponent,
    SurveyTemplatePopupComponent,
    SurveySectionPopupComponent,
    SelectQuestionPopupComponent,
    SdGoalListComponent,
    SdGoalComponent,
    SdGoalPopupComponent,
    ServiceDataStepPopupComponent,
    ChecklistPopupComponent,
    ChecklistItemPopupComponent,
    OrgUnitFieldPopupComponent,
    BankComponent,
    BankPopupComponent,
    DonorComponent,
    DonorPopupComponent,
    ServiceDataFollowupConfigurationComponent,
    ServiceDataFollowupConfigurationPopupComponent,
    UserFollowupPermissionComponent,
    FieldAssessmentPopupComponent,
    FieldAssessmentComponent,
    FieldAssessmentServiceLinkComponent,
    AdminLookupPopupComponent,
    DacOchaNewPopupComponent,
    VacationDatesComponent,
    VacationDatesPopupComponent,
    AdminLookupListComponent,
    AdminLookupComponent,
    CustomMenuComponent,
    CustomMenuPopupComponent,
    ProfilePopupComponent,
    ProfilesComponent,
    ProcessFieldWrapperComponent,
    CustomMenuUrlHandlerComponent,
    CustomMenuPermissionComponent,
    CharityOrganizationProfileExtraDataPopupComponent,
    ProfileOfficersComponent,
    ProfileBranchesComponent,
    BranchOfficersPopupComponent,
    DynamicModelsComponent,
    DynamicModelPopupComponent,
    DeductionRatioComponent,
    DeductionRatioPopupComponent,
    ExternalUserUpdateRequestApprovalComponent,
    ExternalUserUpdateApprovalPopupComponent,
    ExternalUserUpdateChangesPopupComponent,
    UserSecurityExternalComponent,
    ProfileAttachmentsComponent,
    GlobalSettingsComponent,
    AdminLicenseComponent,
    UserFollowupPermissionNewComponent,
    UserPermissionInternalComponent,
    UserPermissionExternalComponent,
    CustomMenuDefaultsPopupComponent,
    ServiceDataCustomTemplatesComponent,
    ServiceDataCustomTemplatePopupComponent,
    AdminPermissionComponent,
    AdminPermissionPopupComponent,
    TrainingProgramClassificationComponent,
    TrainingProgramClassificationPopupComponent,
    NpoEmployeeComponent,
    NpoEmployeePopupComponent,
    SectorComponent,
    SectorPopupComponent,
    NpoProfileComponent,
    CharityProfileComponent,
    NpoProfilePopupComponent,
    CharityProfilePopupComponent,
    InspectionOperationComponent,
    InspectionOperationPopupComponent,
    InspectionOperationChildrenPopupComponent,
    VerificationTemplatesComponent,
    VerificationTemplatePopupComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    DragDropModule,
    FormlyBootstrapModule,
    NgxMaskDirective,
    NgxMaskPipe,
    FormlyModule.forChild({
      types: [
        {name: 'dateField', component: FormlyDateFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'selectField', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'yesOrNo', component: FormlySelectFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'maskInput', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'number', extends: 'input', component: FormlyMaskInputFieldComponent, wrappers: ['custom-wrapper','col-md-4-8']},
        {name: 'textarea', wrappers: ['custom-wrapper','col-md-4-8']},
      ],
      wrappers: [
        {name: 'custom-wrapper', component: ProcessFieldWrapperComponent},
        {name: 'col-md-4-8', component: FormlyFieldWrapperComponent},
        {name: 'col-md-2-10', component: FormlyFieldFullWrapperComponent}
      ]
    }),
  ],
})
export class AdministrationModule {
}
