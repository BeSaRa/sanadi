import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ErrorPageComponent} from './shared/components/error-page/error-page.component';
import {AuthGuard} from './guards/auth-guard';
import {GuestGuard} from './guards/guest-guard';
import {PermissionGuard} from './guards/permission-guard';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {ExternalLoginComponent} from '@app/pages/external-login/external-login.component';
import {InternalLoginComponent} from '@app/pages/internal-login/internal-login.component';
import {ServicesGuard} from '@app/guards/services.guard';
import {DynamicMenuGuard} from '@app/guards/dynamic-menu.guard';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';
import {NewServicePermissionGuard} from '@app/guards/new-service-permission.guard';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ICustomRouteData} from '@contracts/i-custom-route-data';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: InternalLoginComponent, canActivate: [GuestGuard]},
  {path: 'login-external', component: ExternalLoginComponent, canActivate: [GuestGuard]},
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'main', pathMatch: 'full'},
      {
        path: 'administration',
        canActivate: [PermissionGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.ADMIN_PERMISSIONS_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule)
      },
      {path: 'main', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {
        path: 'services/consultations',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/consultation/consultation.module')
          .then(m => m.ConsultationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.CONSULTATION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.CONSULTATION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/inquiries',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/inquiries-and-complaints/inquiries-and-complaints.module')
          .then(m => m.InquiriesAndComplaintsModule),
        data: {
          permissionGroup: PermissionGroupsEnum.CONSULTATION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INQUIRY
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/international-cooperation',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/international-cooperation/international-cooperation.module')
          .then(m => m.InternationalCooperationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INTERNATIONAL_COOP_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INTERNATIONAL_COOPERATION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/project-implementation',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/project-implementation/project-implementation.module')
          .then(m => m.ProjectImplementationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.PROJECT_IMPLEMENTATION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.PROJECT_IMPLEMENTATION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/project-fundraising',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/project-fundraising/project-fundraising.module')
          .then(m => m.ProjectFundraisingModule),
        data: {
          permissionGroup: PermissionGroupsEnum.PROJECT_FUNDRAISING_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.PROJECT_FUNDRAISING
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/project-models',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/project-models/project-models.module')
          .then(m => m.ProjectModelsModule),
        data: {
          permissionGroup: PermissionGroupsEnum.PROJECT_MODEL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.EXTERNAL_PROJECT_MODELS
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/internal-project-license',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/internal-project-license/internal-project-license.module')
          .then(m => m.InternalProjectLicenseModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INTERNAL_PROJECT_LICENSE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INTERNAL_PROJECT_LICENSE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/general-process-notification',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/general-process-notification/general-process-notification.module')
          .then(m => m.GeneralProcessNotificationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.GENERAL_PROCESS_NOTIFICATION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.GENERAL_PROCESS_NOTIFICATION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/awareness-activity-suggestion',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/awareness-activity-suggestion/awareness-activity-suggestion.module')
          .then(m => m.AwarenessActivitySuggestionModule),
        data: {
          permissionGroup: PermissionGroupsEnum.AWARENESS_ACTIVITY_SUGGESTION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.AWARENESS_ACTIVITY_SUGGESTION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/general-association-meeting-attendance',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/general-association-meeting-attendance/general-association-meeting-attendance.module')
          .then(m => m.GeneralAssociationMeetingAttendanceModule),
        data: {
          permissionGroup: PermissionGroupsEnum.GENERAL_ASSOCIATION_MEETING_ATTENDANCE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/internal-bank-account-approval',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/internal-bank-account-approval/internal-bank-account-approval.module')
          .then(m => m.InternalBankAccountApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INTERNAL_BANK_ACCOUNT_APPROVAL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-joint-relief-campaign',
        canActivate: [NewServicePermissionGuard],
        loadChildren: () => import('./modules/services/urgent-joint-relief-campaign/urgent-joint-relief-campaign.module')
          .then(m => m.UrgentJointReliefCampaignModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_JOINT_RELIEF_CAMPAIGN_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/search',
        loadChildren: () => import('@modules/service-search-individual/service-search-individual.module').then(m => m.ServiceSearchIndividualModule),
      },
      {
        path: 'general-services',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/general-services/general-services.module').then(m => m.GeneralServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.GENERAL_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {
        path: 'office-services',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/office-services/office-services.module').then(m => m.OfficeServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.OFFICE_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {path: 'user-inbox', loadChildren: () => import('./user-inbox/user-inbox.module').then(m => m.UserInboxModule)},
      {
        path: 'team-inbox',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./team-inbox/team-inbox.module').then(m => m.TeamInboxModule),
        data: {permissionKey: EServicePermissionsEnum.TEAM_INBOX}
      },
      {
        path: 'services-search',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./services-search/services-search.module').then(m => m.ServicesSearchModule),
        data: {permissionKey: EServicePermissionsEnum.E_SERVICES_SEARCH},
      },
      {path: 'sanady', loadChildren: () => import('./sanady/sanady.module').then(m => m.SanadyModule)},
      {
        path: 'projects',
        canActivate: [ServicesGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.PROJECTS_PERMISSION_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/projects/projects.module').then(m => m.ProjectsModule)
      },
      {
        path: 'training',
        canActivate: [PermissionGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.TRAINING_PROGRAMS_PAGE_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./training-services/training-services.module').then(m => m.TrainingServicesModule)
      },
      {
        path: 'collection',
        canActivate: [ServicesGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.COLLECTION_SERVICES_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/collection/collection.module').then(m => m.CollectionModule)
      },
      {
        path: 'remittance',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/remittances/remittances.module').then(m => m.RemittancesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.REMITTANCE_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {
        path: 'followup',
        loadChildren: () => import('./modules/followup/followup.module').then(m => m.FollowupModule)
      },
      {path: 'reports', loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)},
      {
        path: 'dynamic-menus',
        loadChildren: () => import('./modules/dynamic-menus/dynamic-menus.module').then(m => m.DynamicMenusModule),
        canActivate: [DynamicMenuGuard],
        data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.MODULE}
      },
      {
        path: 'urgent-intervention',
        loadChildren: () => import('./modules/urgent-intervention/urgent-intervention.module').then(m => m.UrgentInterventionModule),
        data: {
          configPermissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_PERMISSIONS_GROUP,
          checkAnyPermission: true
        }
      },
      //{path: '**', redirectTo: '../error'}
    ]
  },
  {path: 'survey', loadChildren: () => import('./survey/survey.module').then(m => m.SurveyModule)},
  {path: 'error', component: ErrorPageComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false, useHash: true, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
