import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { PermissionGuard } from '@app/guards/permission.guard';
import { ExternalCharityComponent } from './external-charity.component';
import { CreateCharityComponent } from './pages/create-charity/create-charity.component';
import { UpdateCharityComponent } from './pages/update-charity/update-charity.component';



const routes: Routes = [
  { path: '', component: ExternalCharityComponent },
  {
    path: 'create-charity', component: CreateCharityComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.EXTERNAL_CHARITY_REQUEST_UPDATE,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'update-charity', component: UpdateCharityComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.EXTERNAL_CHARITY_REQUEST_UPDATE,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternalCharityRoutingModule { }
