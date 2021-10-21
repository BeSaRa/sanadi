import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {ErrorPageComponent} from './shared/components/error-page/error-page.component';
import {AuthGuard} from './guards/auth-guard';
import {GuestGuard} from './guards/guest-guard';
import {PermissionGuard} from './guards/permission-guard';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [GuestGuard]},
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'main', pathMatch: 'full'},
      {
        path: 'administration',
        canActivate: [PermissionGuard],
        data: {configPermissionGroup: 'ADMIN_PERMISSIONS_GROUP', checkAnyPermission: true},
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule)
      },
      {path: 'main', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {
        path: 'e-services',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./e-services/e-services.module').then(m => m.EServicesModule),
        data: {configPermissionGroup: 'E_SERVICES_PERMISSIONS_GROUP', checkAnyPermission: true}
      },
      {path: 'user-inbox', loadChildren: () => import('./user-inbox/user-inbox.module').then(m => m.UserInboxModule)},
      {
        path: 'team-inbox',
        canActivate: [PermissionGuard],
        loadChildren: () => import('./team-inbox/team-inbox.module').then(m => m.TeamInboxModule),
        data: {permissionKey: 'TEAM_INBOX'}
      },
      {
        path: 'services-search',
        loadChildren: () => import('./services-search/services-search.module').then(m => m.ServicesSearchModule)
      },
      {path: 'sanady', loadChildren: () => import('./sanady/sanady.module').then(m => m.SanadyModule)},
      {path: 'projects', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)}
      //{path: '**', redirectTo: '../error'}
    ]
  },
  {path: 'error', component: ErrorPageComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false, useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
