import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {OrganizationUnitComponent} from './pages/organization-unit/organization-unit.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {OrganizationUserComponent} from './pages/organization-user/organization-user.component';
import {PermissionGuard} from '../guards/permission-guard';
import {AttachmentTypesComponent} from './pages/attachment-types/attachment-types.component';
import {ServiceDataComponent} from './pages/service-data/service-data.component';
import {TeamComponent} from './pages/team/team.component';
import {CountryComponent} from './pages/country/country.component';
import {InternalUserComponent} from './pages/internal-user/internal-user.component';
import {
  InternalDepartmentComponent,
} from '@app/administration/pages/internal-department/internal-department.component';
import {JobTitleComponent} from '@app/administration/pages/job-title/job-title.component';
import {DacOchaComponent} from '@app/administration/pages/dac-ocha/dac-ocha.component';
import {SurveyQuestionComponent} from '@app/administration/pages/survey-question/survey-question.component';
import {SurveyTemplateComponent} from '@app/administration/pages/survey-template/survey-template.component';
import {Permissions} from "@app/enums/Permissions";
import {SdGoalComponent} from '@app/administration/pages/sd-goal/sd-goal.component';
import {BankComponent} from '@app/administration/pages/bank/bank.component';
import {DonorComponent} from '@app/administration/pages/donor/donor.component';
import {ExternalFollowupComponent} from '@app/administration/pages/external-followup/external-followup.component';

const routes: Routes = [
  {path: '', component: AdminHomeComponent},
  {
    path: 'localization', component: LocalizationComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_LOCALIZATION', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'custom-role', component: CustomRoleComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_CUSTOM_ROLE', configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'organizations', component: OrganizationUnitComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: null, configPermissionGroup: 'MANAGE_ORG_PERMISSIONS_GROUP', checkAnyPermission: true},
  },
  {
    path: 'aid', component: AidLookupContainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_AID_TYPE', configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'users', component: OrganizationUserComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: null, configPermissionGroup: 'MANAGE_USER_PERMISSIONS_GROUP', checkAnyPermission: true},
  },
  {
    path: 'services', component: ServiceDataComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_SERVICES_DATA', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'attachment-types', component: AttachmentTypesComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_ATTACHMENT_TYPES', configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'teams', component: TeamComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_TEAMS', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'countries', component: CountryComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_COUNTRIES', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'internal-users', component: InternalUserComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_INTERNAL_USERS', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'internal-departments', component: InternalDepartmentComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_INTERNAL_DEPARTMENTS', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'job-titles', component: JobTitleComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_JOB_TITLES', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'ocha-dac-class', component: DacOchaComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_DAC_OUCHA_CATEGORIES', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'survey-questions', component: SurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: Permissions.TRAINING_SURVEY_EDIT_QUESTION,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'survey-templates',
    canActivate: [PermissionGuard], component: SurveyTemplateComponent,
    data: {permissionKey: Permissions.TRAINING_SURVEY_TEMPLATE, configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'sdg', component: SdGoalComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'MANAGE_DAC_OUCHA_CATEGORIES', configPermissionGroup: null, checkAnyPermission: false}
  },

  {path: 'sdg', component: SdGoalComponent},
  {
    path: 'external-followup', component: ExternalFollowupComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'EXTERNAL_FOLLOWUP', configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'bank', component: BankComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'ADMIN_ADD_EDIT_BANK', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'donors', component: DonorComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: Permissions.DONOR_MANAGEMENT, configPermissionGroup: null, checkAnyPermission: false}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
