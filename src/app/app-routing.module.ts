import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ErrorPageComponent} from './shared/components/error-page/error-page.component';
import {AuthGuard} from './guards/auth-guard';
import {GuestGuard} from './guards/guest-guard';
import {PermissionGuard} from './guards/permission-guard';
import {PermissionGroupsEnum} from '@app/enums/permission-groups-enum';
import {EServicePermissionsEnum} from '@app/enums/e-service-permissions-enum';
import {ExternalLoginComponent} from '@app/pages/external-login/external-login.component';
import {InternalLoginComponent} from '@app/pages/internal-login/internal-login.component';
import {ServicesGuard} from '@app/guards/services.guard';
import {DynamicMenuGuard} from '@app/guards/dynamic-menu.guard';
import {DynamicMenuRouteTypeEnum} from '@app/enums/dynamic-menu-route-type.enum';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: InternalLoginComponent, canActivate: [GuestGuard]},
  {path: 'login-external', component: ExternalLoginComponent, canActivate: [GuestGuard]},
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'main', pathMatch: 'full'},
      {
        path: 'administration',
        canActivate: [PermissionGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.ADMIN_PERMISSIONS_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule)
      },
      {path: 'main', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {
        path: 'general-services',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/general-services/general-services.module').then(m => m.GeneralServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.GENERAL_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {
        path: 'office-services',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/office-services/office-services.module').then(m => m.OfficeServicesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.OFFICE_SERVICES_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {path: 'user-inbox', loadChildren: () => import('./user-inbox/user-inbox.module').then(m => m.UserInboxModule)},
      {
        path: 'team-inbox',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./team-inbox/team-inbox.module').then(m => m.TeamInboxModule),
        data: {permissionKey: EServicePermissionsEnum.TEAM_INBOX}
      },
      {
        path: 'services-search',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./services-search/services-search.module').then(m => m.ServicesSearchModule),
        data: {permissionKey: EServicePermissionsEnum.E_SERVICES_SEARCH},
      },
      {path: 'sanady', loadChildren: () => import('./sanady/sanady.module').then(m => m.SanadyModule)},
      {
        path: 'projects',
        canActivate: [ServicesGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.PROJECTS_PERMISSION_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/projects/projects.module').then(m => m.ProjectsModule)
      },
      {
        path: 'training',
        canActivate: [PermissionGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.TRAINING_PROGRAMS_PAGE_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./training-services/training-services.module').then(m => m.TrainingServicesModule)
      },
      {
        path: 'collection',
        canActivate: [ServicesGuard],
        data: {configPermissionGroup: PermissionGroupsEnum.COLLECTION_SERVICES_GROUP, checkAnyPermission: true},
        loadChildren: () => import('./modules/collection/collection.module').then(m => m.CollectionModule)
      },
      {
        path: 'remittance',
        canActivate: [ServicesGuard],
        loadChildren: () => import('./modules/remittances/remittances.module').then(m => m.RemittancesModule),
        data: {configPermissionGroup: PermissionGroupsEnum.REMITTANCE_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      {
        path: 'followup',
        loadChildren: () => import('./modules/followup/followup.module').then(m => m.FollowupModule)
      },
      {path: 'reports', loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)},
      {
        path: 'dynamic-menus', loadChildren: () => import('./modules/dynamic-menus/dynamic-menus.module').then(m => m.DynamicMenusModule),
        canActivate: [DynamicMenuGuard],
        data: {dynamicMenuRouteType: DynamicMenuRouteTypeEnum.MODULE}
      },
      {
        path: 'urgent-intervention',
        loadChildren: () => import('./modules/urgent-intervention/urgent-intervention.module').then(m => m.UrgentInterventionModule),
        data: {configPermissionGroup: PermissionGroupsEnum.URGENT_INTERVENTION_PERMISSIONS_GROUP, checkAnyPermission: true}
      },
      //{path: '**', redirectTo: '../error'}
    ]
  },
  {path: 'survey', loadChildren: () => import('./survey/survey.module').then(m => m.SurveyModule)},
  {path: 'error', component: ErrorPageComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false, useHash: true, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
