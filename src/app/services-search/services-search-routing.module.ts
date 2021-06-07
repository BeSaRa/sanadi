import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicesSearchComponent } from './services-search.component';

const routes: Routes = [{ path: '', component: ServicesSearchComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesSearchRoutingModule { }
