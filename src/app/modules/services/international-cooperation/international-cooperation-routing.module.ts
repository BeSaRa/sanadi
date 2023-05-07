import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  EServiceComponentWrapperComponent
} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {NewServicePermissionGuard} from '@app/guards/new-service-permission.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';
import {
  InternationCooperationOutputsComponent
} from '@modules/services/international-cooperation/pages/internation-cooperation-outputs/internation-cooperation-outputs.component';
import {Constants} from '@helpers/constants';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.INTERNATIONAL_COOPERATION,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'InternationalCooperationComponent'
    }
  },
  {
    path: 'outputs', component: InternationCooperationOutputsComponent,
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
export class InternationalCooperationRoutingModule { }
