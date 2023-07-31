import {TrainingProgramPartnerComponent} from './pages/training-program-partner/training-program-partner.component';
import {AdminLicenseComponent} from './pages/admin-license/admin-license.component';
import {CustomMenuComponent} from './pages/custom-menu/custom-menu.component';
import {GeneralProcessComponent} from './pages/general-process/general-process.component';
import {SubTeamComponent} from './pages/sub-team/sub-team.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminHomeComponent} from './pages/admin-home/admin-home.component';
import {LocalizationComponent} from './pages/localization/localization.component';
import {CustomRoleComponent} from './pages/custom-role/custom-role.component';
import {AidLookupContainerComponent} from './pages/aid-lookup-container/aid-lookup-container.component';
import {ExternalUserComponent} from './pages/external-user/external-user.component';
import {PermissionGuard} from '@app/guards/permission.guard';
import {AttachmentTypesComponent} from './pages/attachment-types/attachment-types.component';
import {ServiceDataComponent} from './pages/service-data/service-data.component';
import {TeamComponent} from './pages/team/team.component';
import {CountryComponent} from './pages/country/country.component';
import {InternalUserComponent} from './pages/internal-user/internal-user.component';
import {
  InternalDepartmentComponent,
} from '@app/administration/pages/internal-department/internal-department.component';
import {JobTitleComponent} from '@app/administration/pages/job-title/job-title.component';
import {SurveyQuestionComponent} from '@app/administration/pages/survey-question/survey-question.component';
import {SurveyTemplateComponent} from '@app/administration/pages/survey-template/survey-template.component';
import {PermissionsEnum} from '@app/enums/permissions-enum';
import {SdGoalComponent} from '@app/administration/pages/sd-goal/sd-goal.component';
import {BankComponent} from '@app/administration/pages/bank/bank.component';
import {DonorComponent} from '@app/administration/pages/donor/donor.component';
import {FieldAssessmentComponent} from '@app/administration/pages/field-assessment/field-assessment.component';
import {VacationDatesComponent} from '@app/administration/pages/vacation-dates/vacation-dates.component';
import {AdminLookupComponent} from '@app/administration/pages/admin-lookup/admin-lookup.component';
import {ProfilesComponent} from './pages/profiles/profiles.component';
import {DynamicModelsComponent} from './pages/dynamic-models/dynamic-models.component';
import {DeductionRatioComponent} from './pages/deduction-ratio/deduction-ratio.component';
import {
  ExternalUserUpdateRequestApprovalComponent
} from '@app/administration/pages/external-user-update-approval/external-user-update-request-approval.component';
import {GlobalSettingsComponent} from '@app/administration/pages/global-settings/global-settings.component';
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';
import { AdminPermissionComponent } from './pages/admin-permission/admin-permission.component';

const routes: Routes = [
  {path: '', component: AdminHomeComponent},
  {
    path: 'localization', component: LocalizationComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_LOCALIZATION, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'custom-role', component: CustomRoleComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_CUSTOM_ROLE, configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'aid', component: AidLookupContainerComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_AID_LOOKUP, configPermissionGroup: null, checkAnyPermission: false},
  },
  {
    path: 'external-users', component: ExternalUserComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_EXTERNAL_USER_DYNAMIC,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'external-user-request-approval', component: ExternalUserUpdateRequestApprovalComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_EXTERNAL_USER_REQUEST_APPROVALS_DYNAMIC,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'services', component: ServiceDataComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_SERVICES_DATA, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'attachment-types', component: AttachmentTypesComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_ATTACHMENT_TYPES,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'teams', component: TeamComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_TEAMS, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'countries', component: CountryComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_COUNTRIES, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'internal-users', component: InternalUserComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_INTERNAL_USERS, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'internal-departments', component: InternalDepartmentComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_INTERNAL_DEPARTMENTS,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'job-titles', component: JobTitleComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_JOB_TITLES, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'training-program-partner', component: TrainingProgramPartnerComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.TRAINING_PROGRAM_PARTNER,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'general-process-template', component: GeneralProcessComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_PROCESS_TEMPLATE,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'sub-team', component: SubTeamComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_SUB_TEAM, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'lookups', component: AdminLookupComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_ADMIN_LOOKUP, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'survey-questions', component: SurveyQuestionComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.TRAINING_SURVEY_QUESTION,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'survey-templates',
    canActivate: [PermissionGuard.canActivate], component: SurveyTemplateComponent,
    data: {
      permissionKey: PermissionsEnum.TRAINING_SURVEY_TEMPLATE,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'sd-goals', component: SdGoalComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_SDG, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'bank', component: BankComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_BANK, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'donors', component: DonorComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_DONORS, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'field-assessment', component: FieldAssessmentComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_FIELD_ASSESSMENT,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'vacation-dates', component: VacationDatesComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_VACATIONS_DATE, configPermissionGroup: null, checkAnyPermission: false
    }
  },
  {
    path: 'menu-items', component: CustomMenuComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_CUSTOM_MENU_ITEM, configPermissionGroup: null, checkAnyPermission: false
    }
  },
  {
    path: 'profiles', component: ProfilesComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_PROFILE, configPermissionGroup: null, checkAnyPermission: false
    },

  },
  {
    path: 'dynamic-models', component: DynamicModelsComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_DYNAMIC_MODEL, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'deduction-ratio', component: DeductionRatioComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_DEDUCTION_RATIO_ITEM,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'global-settings', component: GlobalSettingsComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.MANAGE_SYSTEM_PREFERENCES, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'admin-license', component: AdminLicenseComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: '', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'admin-permissions', component: AdminPermissionComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: '', configPermissionGroup: null, checkAnyPermission: false}
  },
  {path: '**', component: ErrorPageComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {
}
