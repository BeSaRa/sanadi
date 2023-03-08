import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  EServiceComponentWrapperComponent
} from '@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component';
import {NewServicePermissionGuard} from '@app/guards/new-service-permission.guard';
import {ServiceItemResolver} from '@app/resolvers/service-item.resolver';
import {CountryResolver} from '@app/resolvers/country.resolver';
import {EServicePermissionsEnum} from '@enums/e-service-permissions-enum';
import {
  ProjectImplementationOutputsComponent
} from '@modules/services/project-implementation/pages/project-implementation-outputs/project-implementation-outputs.component';
import {Constants} from '@helpers/constants';
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';
import {
  ProjectModelOutputsComponent
} from '@modules/services/project-models/pages/project-model-outputs/project-model-outputs.component';

const routes: Routes = [
  {
    path: 'service', component: EServiceComponentWrapperComponent,
    canActivate: [NewServicePermissionGuard],
    resolve: {info: ServiceItemResolver},
    data: {
      permissionKey: EServicePermissionsEnum.EXTERNAL_PROJECT_MODELS,
      permissionGroup: null,
      checkAnyPermission: false,
      render: 'ProjectModelComponent'
    }
  },
  {
    path: 'outputs', component: ProjectModelOutputsComponent,
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
export class ProjectModelsRoutingModule { }
