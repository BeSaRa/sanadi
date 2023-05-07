import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsComponent} from './projects.component';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {ServicesGuard} from '@app/guards/services.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {
  EServiceComponentWrapperComponent
} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {CountryResolver} from "@app/resolvers/country.resolver";
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';

const routes: Routes = [
  {path: '', component: ProjectsComponent},
  {
    path: 'projects-models', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.EXTERNAL_PROJECT_MODELS,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectModelComponent'
    },
  },
  /*{
    path: 'internal-project-license', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.INTERNAL_PROJECT_LICENSE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternalProjectLicenseComponent'
    }
  },*/
  {
    path: 'internal-bank-account', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.INTERNAL_BANK_ACCOUNT_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternalBankAccountApprovalComponent'
    }
  },
  {
    path: 'urgent-joint-relief-campaign', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.URGENT_JOINT_RELIEF_CAMPAIGN,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentJointReliefCampaignComponent'
    }
  },
  {
    path: 'transferring-individual-funds-abroad', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'TransferringIndividualFundsAbroadComponent'
    }
  },
  {
    path: 'general-association-meeting-attendance', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'GeneralAssociationMeetingAttendanceComponent'
    }
  },
  {
    path: 'projects-fundraising', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver, countries: CountryResolver},
    data: {
      permissionKey: null,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectFundraisingComponent'
    },
  },
  {
    path: 'project-implementation', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard.canActivate],
    resolve: {info: ServiceItemResolver, countries: CountryResolver},
    data: {
      permissionKey: EServicePermissionsEnum.PROJECT_IMPLEMENTATION,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectImplementationComponent'
    }
  },
  {
    path: '**',
    component: ErrorPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {
}
