import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsComponent} from './projects.component';
import {ProjectModelComponent} from "@app/projects/pages/project-model/project-model.component";

const routes: Routes = [
  {path: '', component: ProjectsComponent},
  {path: 'projects-models', component: ProjectModelComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule {
}
