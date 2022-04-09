import {ExternalFollowupComponent} from '@app/modules/followup/pages/external-followup/external-followup.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from '@app/guards/permission-guard';

const routes: Routes = [
  {
    path: 'external-followup',
    component: ExternalFollowupComponent,
    canActivate: [PermissionGuard],
    data: {permissionKey: 'EXTERNAL_FOLLOWUP', configPermissionGroup: null, checkAnyPermission: false}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FollowupRoutingModule {
}
