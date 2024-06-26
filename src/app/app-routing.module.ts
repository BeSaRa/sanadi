import { InspectionModule } from './modules/services/inspection/inspection.module';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ErrorPageComponent} from './shared/components/error-page/error-page.component';
import {AuthGuard} from '@app/guards/auth.guard';
import {GuestGuard} from '@app/guards/guest.guard';
import {PermissionGuard} from '@app/guards/permission.guard';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {ExternalLoginComponent} from '@app/pages/external-login/external-login.component';
import {InternalLoginComponent} from '@app/pages/internal-login/internal-login.component';
import {DynamicMenuGuard} from '@app/guards/dynamic-menu.guard';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';
import {NewServicePermissionGuard} from '@app/guards/new-service-permission.guard';
import {CaseTypes} from '@app/enums/case-types.enum';
import {ICustomRouteData} from '@contracts/i-custom-route-data';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: InternalLoginComponent, canActivate: [GuestGuard.canActivate], data: {isLoginPage: true}},
  {path: 'login-external', component: ExternalLoginComponent, canActivate: [GuestGuard.canActivate], data: {isLoginPage: true}},
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard.canActivate],
    children: [
      {path: '', redirectTo: 'main', pathMatch: 'full'},
      {
        path: 'administration',
        canActivate: [PermissionGuard.canActivate],
        data: {configPermissionGroup: PermissionGroupsEnum.ADMIN_PERMISSIONS_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule)
      },
      {path: 'main', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {
        path: 'services/consultations',
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/internal-project-license/internal-project-license.module')
          .then(m => m.InternalProjectLicenseModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INTERNAL_PROJECT_LICENSE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INTERNAL_PROJECT_LICENSE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/project-completion',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/project-completion/project-completion.module')
          .then(m => m.ProjectCompletionModule),
        data: {
          permissionGroup: PermissionGroupsEnum.PROJECT_COMPLETION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.PROJECT_COMPLETION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/general-process-notification',
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
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
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-joint-relief-campaign/urgent-joint-relief-campaign.module')
          .then(m => m.UrgentJointReliefCampaignModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_JOINT_RELIEF_CAMPAIGN_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/transferring-individual-funds-abroad',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/transferring-individual-funds-abroad/transferring-individual-funds-abroad.module')
          .then(m => m.TransferringIndividualFundsAbroadModule),
        data: {
          permissionGroup: PermissionGroupsEnum.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/initial-external-office-approval',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/initial-external-office-approval/initial-external-office-approval.module')
          .then(m => m.InitialExternalOfficeApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INITIAL_EXTERNAL_OFFICE_APPROVAL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/final-external-office-approval',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/final-external-office-approval/final-external-office-approval.module')
          .then(m => m.FinalExternalOfficeApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.FINAL_EXTERNAL_OFFICE_APPROVAL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/partner-approval',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/partner-approval/partner-approval.module')
          .then(m => m.PartnerApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.PARTNER_APPROVAL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.PARTNER_APPROVAL
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/employment',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/employment/employment.module')
          .then(m => m.EmploymentModule),
        data: {
          permissionGroup: PermissionGroupsEnum.EMPLOYMENT_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.EMPLOYMENT
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/charity-organization-update',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/charity-organization-update/charity-organization-update.module')
          .then(m => m.CharityOrganizationUpdateModule),
        data: {
          permissionGroup: PermissionGroupsEnum.CHARITY_ORGANIZATION_UPDATE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.CHARITY_ORGANIZATION_UPDATE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/npo-management',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/npo-management/npo-management.module')
          .then(m => m.NpoManagementModule),
        data: {
          permissionGroup: PermissionGroupsEnum.NPO_MANAGEMENT_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.NPO_MANAGEMENT
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/foreign-countries-projects',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/foreign-countries-projects/foreign-countries-projects.module')
          .then(m => m.ForeignCountriesProjectsModule),
        data: {
          permissionGroup: PermissionGroupsEnum.FOREIGN_COUNTRIES_PROJECTS_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.FOREIGN_COUNTRIES_PROJECTS
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/external-org-affiliation',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/external-organization-affiliation/external-organization-affiliation.module')
          .then(m => m.ExternalOrganizationAffiliationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.EXTERNAL_ORG_AFFILIATION_REQUEST_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/organization-entities-support',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/organization-entities-support/organization-entities-support.module')
          .then(m => m.OrganizationEntitiesSupportModule),
        data: {
          permissionGroup: PermissionGroupsEnum.ORGANIZATION_ENTITIES_SUPPORT_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.ORGANIZATION_ENTITIES_SUPPORT
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/coordination-with-organizations-request',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/coordination-with-organization-request/coordination-with-organization-request.module')
          .then(m => m.CoordinationWithOrganizationRequestModule),
        data: {
          permissionGroup: PermissionGroupsEnum.COORDINATION_WITH_ORGANIZATION_REQUEST_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/customs-exemption',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/customs-exemption-remittance/customs-exemption-remittance.module')
          .then(m => m.CustomsExemptionRemittanceModule),
        data: {
          permissionGroup: PermissionGroupsEnum.CUSTOMS_EXEMPTION_REMITTANCE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/financial-transfers-licensing',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/financial-transfer-licensing/financial-transfer-licensing.module')
          .then(m => m.FinancialTransferLicensingModule),
        data: {
          permissionGroup: PermissionGroupsEnum.FINANCIAL_TRANSFERS_LICENSING_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.FINANCIAL_TRANSFERS_LICENSING
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/collection-approval',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/collection-approval/collection-approval.module')
          .then(m => m.CollectionApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.COLLECTION_APPROVAL_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.COLLECTION_APPROVAL
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/collector-approval',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/collector-approval/collector-approval.module')
          .then(m => m.CollectorApprovalModule),
        data: {
          permissionGroup: PermissionGroupsEnum.COLLECTOR_LICENSING_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.COLLECTOR_LICENSING
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/fundraising-licensing',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/fundraising-channel-licensing/fundraising-channel-licensing.module')
          .then(m => m.FundraisingChannelLicensingModule),
        data: {
          permissionGroup: PermissionGroupsEnum.FUNDRAISING_LICENSING_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.FUNDRAISING_LICENSING
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-intervention-license',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-intervention-licensing/urgent-intervention-licensing.module')
          .then(m => m.UrgentInterventionLicensingModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_LICENSING_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_INTERVENTION_LICENSING
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-intervention-announcement',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-intervention-announcement/urgent-intervention-announcement.module')
          .then(m => m.UrgentInterventionAnnouncementModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_ANNOUNCEMENT_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-intervention-closure',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-intervention-closure/urgent-intervention-closure.module')
          .then(m => m.UrgentInterventionClosureModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_CLOSURE_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_INTERVENTION_CLOSURE
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-intervention-financial-notification',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-intervention-financial-notification/urgent-intervention-financial-notification.module')
          .then(m => m.UrgentInterventionFinancialNotificationModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/urgent-intervention-license-followup',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/urgent-intervention-license-followup/urgent-intervention-license-followup.module')
          .then(m => m.UrgentInterventionLicenseFollowupModule),
        data: {
          permissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_LICENSE_FOLLOWUP_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/financial-analysis',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/financial-analysis/financial-analysis.module')
          .then(m => m.FinancialAnalysisModule),
        data: {
          permissionGroup: PermissionGroupsEnum.FINANCIAL_ANALYSIS_SERVICES_PERMISSION_GROUP,
          checkAnyPermission: true,
          caseType: CaseTypes.FINANCIAL_ANALYSIS
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/inspection',
        canActivate: [NewServicePermissionGuard.canActivate],
        loadChildren: () => import('./modules/services/inspection/inspection.module')
          .then(m => m.InspectionModule),
        data: {
          permissionGroup: PermissionGroupsEnum.INSPECTION_SERVICE_PERMISSION_GROUP,
          checkAnyPermission: true,
        } as Partial<ICustomRouteData>
      },
      {
        path: 'services/search',
        loadChildren: () => import('@modules/service-search-individual/service-search-individual.module').then(m => m.ServiceSearchIndividualModule),
      },
      /*{
        path: 'general-services',
        canActivate: [ServicesGuard.canActivate],
        loadChildren: () => import('./modules/general-services/general-services.module').then(m => m.GeneralServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.GENERAL_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {
        path: 'office-services',
        canActivate: [ServicesGuard.canActivate],
        loadChildren: () => import('./modules/office-services/office-services.module').then(m => m.OfficeServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.OFFICE_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },*/
      {path: 'user-inbox', loadChildren: () => import('./user-inbox/user-inbox.module').then(m => m.UserInboxModule)},
      {path: 'manage-user-inbox', loadChildren: () => import('./modules/inbox/inbox.module').then(m => m.InboxModule)},
      {
        path: 'team-inbox',
        canActivate: [PermissionGuard.canActivate],
        loadChildren: () => import('./team-inbox/team-inbox.module').then(m => m.TeamInboxModule),
        data: {permissionKey: EServicePermissionsEnum.TEAM_INBOX}
      },
      {
        path: 'services-search',
        canActivate: [PermissionGuard.canActivate],
        loadChildren: () => import('./services-search/services-search.module').then(m => m.ServicesSearchModule),
        data: {permissionKey: EServicePermissionsEnum.E_SERVICES_SEARCH},
      },
      {path: 'sanady', loadChildren: () => import('./sanady/sanady.module').then(m => m.SanadyModule)},
      {path: 'restricted', loadChildren: () => import('./restricted/restricted.module').then(m => m.RestrictedModule)},
      /*{
        path: 'projects',
        canActivate: [ServicesGuard.canActivate],
        data: {configPermissionGroup: PermissionGroupsEnum.PROJECTS_PERMISSION_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/projects/projects.module').then(m => m.ProjectsModule)
      },*/
      {
        path: 'training',
        canActivate: [PermissionGuard.canActivate],
        data: {configPermissionGroup: PermissionGroupsEnum.TRAINING_PROGRAMS_PAGE_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./training-services/training-services.module').then(m => m.TrainingServicesModule)
      },
      /*{
        path: 'collection',
        canActivate: [ServicesGuard.canActivate],
        data: {configPermissionGroup: PermissionGroupsEnum.COLLECTION_SERVICES_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/collection/collection.module').then(m => m.CollectionModule)
      },
      {
        path: 'remittance',
        canActivate: [ServicesGuard.canActivate],
        loadChildren: () => import('./modules/remittances/remittances.module').then(m => m.RemittancesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.REMITTANCE_PERMISSIONS_GROUP, checkAnyPermission: true}
      },*/
      {
        path: 'followup',
        loadChildren: () => import('./modules/followup/followup.module').then(m => m.FollowupModule)
      },
      /*{path: 'reports', loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)},*/
      {
        path: 'dynamic-menus',
        loadChildren: () => import('./modules/dynamic-menus/dynamic-menus.module').then(m => m.DynamicMenusModule),
        canActivate: [DynamicMenuGuard.canActivate],
        data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.MODULE}
      },
      /*{
        path: 'urgent-intervention',
        loadChildren: () => import('./modules/urgent-intervention/urgent-intervention.module').then(m => m.UrgentInterventionModule),
        data: {
          configPermissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_PERMISSIONS_GROUP,
          checkAnyPermission: true
        }
      },*/
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
