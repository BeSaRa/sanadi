import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { ExternalCharityRoutingModule } from './external-carity-routing.module';
import { ExternalCharityComponent } from './external-charity.component';
import { CreateCharityComponent } from './pages/create-charity/create-charity.component';
import { UpdateCharityComponent } from './pages/update-charity/update-charity.component';
import { CreateCharityPopupComponent } from './popups/create-charity-popup/create-charity-popup.component';
import { ExternalCharityFounderPopupComponent } from './popups/external-charity-founder-popup/external-charity-founder-popup.component';
import { SelectExternalCharityPopupComponent } from './popups/select-external-charity-popup/select-external-charity-popup.component';
import { UpdateCharityPopupComponent } from './popups/update-charity-popup/update-charity-popup.component';
import { UpdateCharityStatusPopupComponent } from './popups/update-charity-status-popup/update-charity-status-popup.component';
import { ExternalCharityAttachmentsComponent } from './shared/external-charity-attachments/external-charity-attachments.component';
import { FoundersComponent } from './shared/founders/founders.component';
import { ExternalCharityLogsComponent } from './shared/external-charity-logs/external-charity-logs.component';



@NgModule({
  declarations: [
    ExternalCharityComponent,
    CreateCharityComponent,
    UpdateCharityComponent,
    CreateCharityPopupComponent,
    UpdateCharityPopupComponent,
    ExternalCharityFounderPopupComponent,
    FoundersComponent,
    ExternalCharityFounderPopupComponent,
    SelectExternalCharityPopupComponent,
    UpdateCharityStatusPopupComponent,
    ExternalCharityAttachmentsComponent,
    ExternalCharityLogsComponent
  ],
  imports: [
    CommonModule,
    ExternalCharityRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ExternalCharityModule { }
