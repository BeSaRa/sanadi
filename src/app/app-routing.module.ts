import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {ErrorPageComponent} from './shared/components/error-page/error-page.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {
    path: 'home', component: HomeComponent,
    children: [
      {path: '', redirectTo: 'user', pathMatch: 'full'},
      {path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)},
      {path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {path: 'error', component: ErrorPageComponent},
      {path: '**', component: ErrorPageComponent},
    ]
  },
  {path: '**', redirectTo: 'home/error'}
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
