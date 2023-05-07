import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '@app/guards/permission.guard';
import {TrainingServicesComponent} from '@app/training-services/training-services.component';
import {AccreditedTrainerComponent} from '@app/training-services/pages/accredited-trainer/accredited-trainer.component';
import {TrainingProgramComponent} from '@app/training-services/pages/training-program/training-program.component';
import {AvailableProgramsComponent} from '@app/training-services/pages/available-programs/available-programs.component';
import {CertificatesComponent} from '@app/training-services/pages/certificates/certificates.component';
import {PermissionGroupsEnum} from "@app/enums/permission-groups-enum";
import {PermissionsEnum} from '@app/enums/permissions-enum';

const routes: Routes = [
  {path: '', component: TrainingServicesComponent},
  {
    path: 'trainer', component: AccreditedTrainerComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.TRAINING_ADD_TRAINEE, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'program', component: TrainingProgramComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: null,
      configPermissionGroup: PermissionGroupsEnum.TRAINING_PROGRAMS_MENU_ITEM_GROUP,
      checkAnyPermission: true
    }
  },
  {
    path: 'available-programs', component: AvailableProgramsComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.TRAINING_CHARITY_MANAGEMENT, configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'certificate-templates', component: CertificatesComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {permissionKey: PermissionsEnum.TRAINING_CERTIFICATE_TEMPLATE, configPermissionGroup: null, checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingServicesRoutingModule {
}
