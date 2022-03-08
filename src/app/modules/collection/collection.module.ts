import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './collection.component';
import {SharedModule} from "@app/shared/shared.module";
import { CollectionApprovalComponent } from './pages/collection-services-approval/collection-approval.component';
import { CollectionItemComponent } from './shared/collection-item/collection-item.component';
import { CollectionApprovalApproveTaskPopupComponent } from './popups/collection-approval-approve-task-poup/collection-approval-approve-task-popup.component';
import { ApprovalFormComponent } from './shared/approval-form/approval-form.component';


@NgModule({
  declarations: [
    CollectionComponent,
    CollectionApprovalComponent,
    CollectionItemComponent,
    CollectionApprovalApproveTaskPopupComponent,
    ApprovalFormComponent
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    SharedModule
  ]
})
export class CollectionModule { }
