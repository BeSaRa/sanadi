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
  UrgentInterventionLicenseFollowupOutputsComponent
} from '@modules/services/urgent-intervention-license-followup/pages/urgent-intervention-license-followup-outputs/urgent-intervention-license-followup-outputs.component';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionLicenseFollowupComponent'
    }
  },
  {
    path: 'outputs', component: UrgentInterventionLicenseFollowupOutputsComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
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
export class UrgentInterventionLicenseFollowupRoutingModule { }
