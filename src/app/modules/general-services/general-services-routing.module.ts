import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GeneralServicesComponent} from './general-services.component';
import {
  EServiceComponentWrapperComponent
} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {ServicesGuard} from '@app/guards/services.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';

const routes: Routes = [
  { path: '', component: GeneralServicesComponent },
  {
    path: 'inquiries', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.INQUIRY,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InquiryComponent'
    }
  },
  {
    path: 'consultations', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.CONSULTATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ConsultationComponent'
    }
  },
  {
    path: 'external-org-affiliation', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.EXTERNAL_ORG_AFFILIATION_REQUEST,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ExternalOrgAffiliationComponent'
    }
  },
  {
    path: 'international-coop', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.INTERNATIONAL_COOPERATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternationalCooperationComponent'
    }
  },
  {
    path: 'employment', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.EMPLOYMENT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'EmploymentComponent'
    }
  },
  {
    path: 'foreign-countries-projects', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.FOREIGN_COUNTRIES_PROJECTS,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ForeignCountriesProjectsComponent'
    }
  },
  {
    path: 'coordination-with-organizations-request', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.COORDINATION_WITH_ORGANIZATION_REQUEST,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'CoordinationWithOrganizationsRequestComponent'
    },

  },
  {
    path: 'npo-management', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.NPO_MANAGEMENT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'NpoManagementComponent'
    }
  },
  {
    path: 'charity-organization-update', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.CHARITY_ORGANIZATION_UPDATE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'CharityOrganizationUpdateComponent'
    }
  },
  {
    path: 'awareness-activity-suggestion', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.AWARENESS_ACTIVITY_SUGGESTION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'AwarenessActivitySuggestionComponent'
    }
  },
  {
    path: 'general-process-notification', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.GENERAL_PROCESS_NOTIFICATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'GeneralProcessNotificationComponent'
    }
  },
  {
    path: 'organizations-entities-support', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: { info: ServiceItemResolver },
    data: {
      permissionKey: EServicePermissionsEnum.ORGANIZATION_ENTITIES_SUPPORT,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'OrganizationsEntitiesSupportComponent'
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralServicesRoutingModule {
}
