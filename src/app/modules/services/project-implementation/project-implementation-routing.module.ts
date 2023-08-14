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
  ProjectImplementationOutputsComponent
} from '@modules/services/project-implementation/pages/project-implementation-outputs/project-implementation-outputs.component';
import {CountryResolver} from '@app/resolvers/country.resolver';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    resolve: {info: ServiceItemResolver.resolve, countries: CountryResolver.resolve},
    data: {
      permissionKey: EServicePermissionsEnum.PROJECT_IMPLEMENTATION,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectImplementationComponent'
    }
  },
  {
    path: 'outputs', component: ProjectImplementationOutputsComponent,
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
export class ProjectImplementationRoutingModule { }
