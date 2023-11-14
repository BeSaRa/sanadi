import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { PermissionGuard } from '@app/guards/permission.guard';
import { WorldCheckSerachComponent } from './pages/world-check-search/world-check-search.component';
import { RestrictedComponent } from './restricted.component';
import { ScreeningSearchAuditComponent } from './pages/screening-search-audit/screening-search-audit.component';



const routes: Routes = [
  { path: '', component: RestrictedComponent },
  {
    path: 'world-check-search', component: WorldCheckSerachComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.WORLD_CHECK_SEARCH,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'screening-search-audit', component: ScreeningSearchAuditComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.SCREENING_SEARCH_AUDIT,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestrictedRoutingModule { }
