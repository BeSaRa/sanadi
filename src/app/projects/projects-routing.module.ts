import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsComponent} from './projects.component';
import {InternalProjectLicenseComponent} from '@app/projects/pages/internal-project-license/internal-project-license.component';
import {ProjectModelComponent} from '@app/projects/pages/project-model/project-model.component';
import {EServicePermissions} from '@app/enums/e-service-permissions';
import {ServicesGuard} from '@app/guards/services.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServiceComponentWrapperComponent} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';

const routes: Routes = [
  {path: '', component: ProjectsComponent},
  {
    path: 'projects-models', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.EXTERNAL_PROJECT_MODELS,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectModelComponent'
    },
  },
  {
    path: 'internal-project-license', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.INTERNAL_PROJECT_LICENSE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternalProjectLicenseComponent'
    }
  },
  {
    path: 'internal-bank-account', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.INTERNAL_BANK_ACCOUNT_APPROVAL,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'InternalBankAccountApprovalComponent'
    }
  },
  {
    path: 'urgent-joint-relief-campaign', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.URGENT_JOINT_RELIEF_CAMPAIGN,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentJointReliefCampaignComponent'
    }
  },
  {
    path: 'transferring-individual-funds-abroad', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'TransferringIndividualFundsAbroadComponent'
    }
  },
  {
    path: 'general-association-meeting-attendance', component: EServiceComponentWrapperComponent,
    canActivate: [ServicesGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissions.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
      configPermissionGroup: null,
      checkAnyPermission: false,
      render: 'GeneralAssociationMeetingAttendanceComponent'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {
}
