import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
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
      {
        path: 'administration',
        loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule)
      },
      {path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
      {path: 'error', component: ErrorPageComponent},
      {path: '**', component: ErrorPageComponent},
    ]
  },
  {path: '**', redirectTo: 'home/error'}
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})], //, useHash: true
  exports: [RouterModule]
})
export class AppRoutingModule {
}
