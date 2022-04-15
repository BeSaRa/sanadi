import {ExternalFollowupComponent} from '@app/modules/followup/pages/external-followup/external-followup.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '@app/guards/permission-guard';
import {InternalFollowupComponent} from '@app/modules/followup/pages/internal-followup/internal-followup.component';

const routes: Routes = [
  {
    path: 'external-followup',
    component: ExternalFollowupComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'EXTERNAL_FOLLOWUP', configPermissionGroup: null, checkAnyPermission: false}
  },
  {
    path: 'internal-followup',
    component: InternalFollowupComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'INTERNAL_FOLLOWUP', configPermissionGroup: null, checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FollowupRoutingModule {
}
