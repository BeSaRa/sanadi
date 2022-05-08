import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '@app/guards/permission-guard';
import {TrainingServicesComponent} from '@app/training-services/training-services.component';
import {AccreditedTrainerComponent} from '@app/training-services/pages/accredited-trainer/accredited-trainer.component';
import {TrainingProgramComponent} from '@app/training-services/pages/training-program/training-program.component';
import {AvailableProgramsComponent} from '@app/training-services/pages/available-programs/available-programs.component';
import {CertificatesComponent} from '@app/training-services/pages/certificates/certificates.component';
import {PermissionGroup} from "@app/enums/permission-group";
import {Permissions} from '@app/enums/Permissions';

const routes: Routes = [
  {path: '', component: TrainingServicesComponent},
  {
    path: 'trainer', component: AccreditedTrainerComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: Permissions.TRAINING_ADD_TRAINEE, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'program', component: TrainingProgramComponent,
    canActivate: [PermissionGuard],
    data: {
      permissionKey: null,
      configPermissionGroup: PermissionGroup.TRAINING_PROGRAMS_MENU_ITEM_GROUP,
      checkAnyPermission: true
    }
  },
  {
    path: 'available-programs', component: AvailableProgramsComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: Permissions.TRAINING_CHARITY_MANAGEMENT, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'certificate-templates', component: CertificatesComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: Permissions.TRAINING_CERTIFICATE_TEMPLATE, configPermissionGroup: null, checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingServicesRoutingModule {
}
