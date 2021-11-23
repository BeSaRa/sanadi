import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsComponent} from './projects.component';
import {PermissionGuard} from '@app/guards/permission-guard';
import {InternalProjectLicenseComponent} from '@app/projects/pages/internal-project-license/internal-project-license.component';
import {ProjectModelComponent} from "@app/projects/pages/project-model/project-model.component";
import {EServicePermissions} from "@app/enums/e-service-permissions";

const routes: Routes = [
  {path: '', component: ProjectsComponent},
  {
    path: 'projects-models',
    canActivate: [PermissionGuard],
    component: ProjectModelComponent,
    data: {
      permissionKey: EServicePermissions.EXTERNAL_PROJECT_MODELS,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'internal-project-license', component: InternalProjectLicenseComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: EServicePermissions.INTERNAL_PROJECT_LICENSE,
      configPermissionGroup: null,
      checkAnyPermission: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {
}
