import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamInboxComponent } from './team-inbox.component';

const routes: Routes = [{ path: '', component: TeamInboxComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamInboxRoutingModule { }
