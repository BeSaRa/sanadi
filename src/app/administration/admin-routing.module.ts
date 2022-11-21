import { CustomMenuComponent } from './pages/custom-menu/custom-menu.component';
import { GeneralProcessComponent } from './pages/general-process/general-process.component';
import { SubTeamComponent } from './pages/sub-team/sub-team.component';
import {OrganizationUnitFieldComponent} from './pages/organization-unit-field/organization-unit-field.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {ExternalUserComponent} from './pages/external-user/external-user.component';
import {PermissionGuard} from '../guards/permission-guard';
import {AttachmentTypesComponent} from './pages/attachment-types/attachment-types.component';
import {ServiceDataComponent} from './pages/service-data/service-data.component';
import {TeamComponent} from './pages/team/team.component';
import {CountryComponent} from './pages/country/country.component';
import {InternalUserComponent} from './pages/internal-user/internal-user.component';
import {InternalDepartmentComponent,} from '@app/administration/pages/internal-department/internal-department.component';
import {JobTitleComponent} from '@app/administration/pages/job-title/job-title.component';
import {SurveyQuestionComponent} from '@app/administration/pages/survey-question/survey-question.component';
import {SurveyTemplateComponent} from '@app/administration/pages/survey-template/survey-template.component';
import {PermissionsEnum} from '@app/enums/permissions-enum';
import {SdGoalComponent} from '@app/administration/pages/sd-goal/sd-goal.component';
import {BankComponent} from '@app/administration/pages/bank/bank.component';
import {DonorComponent} from '@app/administration/pages/donor/donor.component';
import {FieldAssessmentComponent} from '@app/administration/pages/field-assessment/field-assessment.component';
import {VactionDatesComponent} from './pages/vaction-dates/vaction-dates.component';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {AdminLookupComponent} from '@app/administration/pages/admin-lookup/admin-lookup.component';
import {AdminLookupOldComponent} from './pages/admin-lookup-old/admin-lookup-old.component';
import {ProfilesComponent} from './pages/profiles/profiles.component';
import { JobTitleCloneComponent } from './pages/job-title-clone/job-title-clone.component';

const routes: Routes = [
  { path: '', component: AdminHomeComponent },
  {
    path: 'localization', component: LocalizationComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_LOCALIZATION, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'custom-role', component: CustomRoleComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_CUSTOM_ROLE, configPermissionGroup: null, checkAnyPermission: false },
  },
  /*{
    path: 'organizations', component: OrganizationUnitComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: null, configPermissionGroup: PermissionGroupsEnum.MANAGE_ORGANIZATION_PERMISSIONS_GROUP, checkAnyPermission: true },
  },*/
  {
    path: 'aid', component: AidLookupContainerComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_AID_LOOKUP, configPermissionGroup: null, checkAnyPermission: false },
  },
  {
    path: 'external-users', component: ExternalUserComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: null, configPermissionGroup: PermissionGroupsEnum.MANAGE_EXTERNAL_USER_PERMISSIONS_GROUP, checkAnyPermission: true },
  },
  {
    path: 'services', component: ServiceDataComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_SERVICES_DATA, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'attachment-types', component: AttachmentTypesComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_ATTACHMENT_TYPES, configPermissionGroup: null, checkAnyPermission: false },
  },
  {
    path: 'teams', component: TeamComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_TEAMS, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'countries', component: CountryComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_COUNTRIES, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'internal-users', component: InternalUserComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_INTERNAL_USERS, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'internal-departments', component: InternalDepartmentComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_INTERNAL_DEPARTMENTS, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'job-titles', component: JobTitleComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_JOB_TITLES, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'general-process-template', component: GeneralProcessComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_PROCESS_TEMPLATE, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'sub-team', component: SubTeamComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_SUB_TEAM, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'lookups', component: AdminLookupComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_ADMIN_LOOKUP, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'lookups-old', component: AdminLookupOldComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_ADMIN_LOOKUP, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'survey-questions', component: SurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: PermissionsEnum.TRAINING_SURVEY_QUESTION,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'survey-templates',
    canActivate: [PermissionGuard], component: SurveyTemplateComponent,
    data: { permissionKey: PermissionsEnum.TRAINING_SURVEY_TEMPLATE, configPermissionGroup: null, checkAnyPermission: false },
  },
  {
    path: 'sdg', component: SdGoalComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_SDG, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'bank', component: BankComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_BANK, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'donors', component: DonorComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_DONORS, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'field-assessment', component: FieldAssessmentComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_FIELD_ASSESSMENT, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'organization-unit-field', component: OrganizationUnitFieldComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_ORG_UNIT_FIELDS, configPermissionGroup: null, checkAnyPermission: false }
  },
  {
    path: 'vacation-dates', component: VactionDatesComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: PermissionsEnum.MANAGE_VACATIONS_DATE, configPermissionGroup: null, checkAnyPermission: false
    }
  },
  {
    path: 'menu-items', component: CustomMenuComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: PermissionsEnum.MANAGE_CUSTOM_MENU_ITEM, configPermissionGroup: null, checkAnyPermission: false
    }
  },
  {
    path: 'profiles', component: ProfilesComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: PermissionsEnum.MANAGE_PROFILE, configPermissionGroup: null, checkAnyPermission: false
    }
  },
  {
    path: 'job-titles-clone', component: JobTitleCloneComponent,
    canActivate: [PermissionGuard],
    data: { permissionKey: PermissionsEnum.MANAGE_JOB_TITLES_CLONE, configPermissionGroup: null, checkAnyPermission: false }
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
