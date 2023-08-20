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
  UrgentInterventionAnnouncementOutputsComponent
} from '@modules/services/urgent-intervention-announcement/pages/urgent-intervention-announcement-outputs/urgent-intervention-announcement-outputs.component';
import {PreValidateDataGuard} from '@app/guards/pre-validate-data.guard';
import {ICustomRouteData} from '@contracts/i-custom-route-data';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard.canActivate, PreValidateDataGuard.canActivate],
    resolve: {info: ServiceItemResolver.resolve},
    data: {
      permissionKey: EServicePermissionsEnum.URGENT_INTERVENTION_ANNOUNCEMENT,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'UrgentInterventionAnnouncementComponent',
      preValidateFailMsgKey: 'msg_add_intervention_license_first'
    } as Partial<ICustomRouteData>
  },
  {
    path: 'outputs', component: UrgentInterventionAnnouncementOutputsComponent,
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
export class UrgentInterventionAnnouncementRoutingModule { }
