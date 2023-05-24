import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PermissionGuard } from "@app/guards/permission.guard";
import { ErrorPageComponent } from "@app/shared/components/error-page/error-page.component";
import { ManageUserInboxComponent } from "./pages/manage-user-inbox/manage-user-inbox.component";

const routes: Routes = [
  {
    path: '', component: ManageUserInboxComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      // permissionKey: PermissionsEnum.INBOX_FOLLOW_UP,
      permissionKey: '',
      permissionGroup: null,
      checkAnyPermission: false,
    }
  },

  {path: '**', component: ErrorPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboxRoutingModule {
}
