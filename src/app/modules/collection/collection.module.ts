import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionComponent } from './collection.component';
import {SharedModule} from "@app/shared/shared.module";
import { CollectionApprovalComponent } from './pages/collection-services-approval/collection-approval.component';
import { CollectionItemComponent } from './shared/collection-item/collection-item.component';


@NgModule({
  declarations: [
    CollectionComponent,
    CollectionApprovalComponent,
    CollectionItemComponent
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    SharedModule
  ]
})
export class CollectionModule { }
