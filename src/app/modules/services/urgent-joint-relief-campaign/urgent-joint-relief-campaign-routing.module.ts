import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  EServiceComponentWrapperComponent
} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {NewServicePermissionGuard} from '@app/guards/new-service-permission.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServicePermissionsEnum} from '@enums/e-service-permissions-enum';
import {Constants} from '@helpers/constants';
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';
import {
  UrgentJointReliefCampaignOutputsComponent
} from '@modules/services/urgent-joint-relief-campaign/pages/urgent-joint-relief-campaign-outputs/urgent-joint-relief-campaign-outputs.component';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.URGENT_JOINT_RELIEF_CAMPAIGN,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentJointReliefCampaignComponent'
    }
  },
  {
    path: 'outputs', component: UrgentJointReliefCampaignOutputsComponent,
    canActivate: [NewServicePermissionGuard],
    data: {
      permissionKey: Constants.SERVICE_OUTPUT_PERMISSION,
      permissionGroup: null,
      checkAnyPermission: false
    }
  },
  {path: '', redirectTo: 'service', pathMatch: 'full'},
  {path: '**', component: ErrorPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UrgentJointReliefCampaignRoutingModule { }
