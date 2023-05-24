import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ManageUserInboxComponent } from './pages/manage-user-inbox/manage-user-inbox.component';
import { ReassignTaskPopupComponent } from './popups/reassign-task-popup/reassign-task-popup.component';
import { SharedModule } from '@app/shared/shared.module';
import { InboxRoutingModule } from './inbox-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InboxRoutingModule
  ],
  declarations: [
    ManageUserInboxComponent,
    ReassignTaskPopupComponent,

  ]
})
export class InboxModule { }
