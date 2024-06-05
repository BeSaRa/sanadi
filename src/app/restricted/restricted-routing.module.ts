import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { PermissionGuard } from '@app/guards/permission.guard';
import { WorldCheckSerachComponent } from './pages/world-check-search/world-check-search.component';
import { RestrictedComponent } from './restricted.component';
import { ScreeningSearchAuditComponent } from './pages/screening-search-audit/screening-search-audit.component';
import { CommissionDatabaseComponent } from './pages/commission-database/commission-database.component';
import { TerrorismMoiComponent } from './pages/terrorism-moi/terrorism-moi.component';
import { BannedPersonDraftComponent } from './pages/banned-person-draft/banned-person-draft.component';
import { BannedPersonReturnedRequestsComponent } from './pages/banned-person-returned-requests/banned-person-returned-requests.component';
import { BannedPersonApproveRequestsComponent } from './pages/banned-person-approve-requests/banned-person-approve-requests.component';
import { BannedPersonSearchComponent } from './pages/banned-person-search/banned-person-search.component';



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
  {
    path: 'commission-database', component: CommissionDatabaseComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_RACA,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'terrorism-moi', component: TerrorismMoiComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_MOI,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'banned-person-draft', component: BannedPersonDraftComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_RACA,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'banned-person-returned-requests', component: BannedPersonReturnedRequestsComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_RACA,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'banned-person-approve-requests', component: BannedPersonApproveRequestsComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_RACA,
      configPermissionGroup: null,
      checkAnyPermission: false
    },
  },
  {
    path: 'banned-person-search', component: BannedPersonSearchComponent,
    canActivate: [PermissionGuard.canActivate],
    data: {
      permissionKey: PermissionsEnum.MANAGE_BANNED_PERSON_RACA ||PermissionsEnum.MANAGE_BANNED_PERSON_MOI ,
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
