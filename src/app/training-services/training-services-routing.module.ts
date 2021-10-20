import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '@app/guards/permission-guard';
import {TrainingServicesComponent} from '@app/training-services/training-services.component';
import {AccreditedTrainerComponent} from '@app/training-services/pages/accredited-trainer/accredited-trainer.component';

const routes: Routes = [
  {path: '', component: TrainingServicesComponent},
  {
    path: 'trainer', component: AccreditedTrainerComponent,
    canActivate: [PermissionGuard],
    //data: {permissionKey: 'MANAGE_CUSTOM_ROLE'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingServicesRoutingModule { }
