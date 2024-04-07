import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { NewServicePermissionGuard } from '@app/guards/new-service-permission.guard';
import { ErrorPageComponent } from '@app/shared/components/error-page/error-page.component';
import { EServicePermissionsEnum } from '@enums/e-service-permissions-enum';
import { ActualInspectionComponent } from './pages/actual-inspection/actual-inspection.component';
import { LicenseActivityComponent } from './pages/license-activity/license-activity.component';
import { ProposedInspectionComponent } from './pages/proposed-inspection/proposed-inspection.component';
import { ActivityImplementationComponent } from './pages/activity-implementation/activity-implementation.component';

const routes: Routes = [
  {
    path: 'actual', component: ActualInspectionComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    data: {
      permissionKey: EServicePermissionsEnum.ACTUAL_INSPECTION,
      permissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'proposed', component: ProposedInspectionComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    data: {
      permissionKey: EServicePermissionsEnum.PROPOSED_INSPECTION,
      permissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'implementation', component: ActivityImplementationComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    data: {
      permissionKey: EServicePermissionsEnum.INSPECTION,
      permissionGroup: null,
      checkAnyPermission: false
    }
  },
  {
    path: 'licenses', component: LicenseActivityComponent,
    canActivate: [NewServicePermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_LICENSES_AND_PERMITS,
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
export class InspectionRoutingModule {
}
