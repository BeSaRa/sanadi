import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamInboxRoutingModule } from './team-inbox-routing.module';
import { TeamInboxComponent } from './team-inbox.component';
import {SharedModule} from '../shared/shared.module';


@NgModule({
  declarations: [TeamInboxComponent],
  imports: [
    CommonModule,
    SharedModule,
    TeamInboxRoutingModule
  ]
})
export class TeamInboxModule { }
