import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsComponent} from './projects.component';
import {ProjectModelComponent} from "@app/projects/pages/project-model/project-model.component";
import {PermissionGuard} from "@app/guards/permission-guard";

const routes: Routes = [
  {path: '', component: ProjectsComponent},
  {
    path: 'projects-models',
    canActivate: [PermissionGuard],
    component: ProjectModelComponent,
    data: {permissionKey: null, configPermissionGroup: null, checkAnyPermission: false},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {
}
