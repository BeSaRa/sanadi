import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MouseEnterLeaveDirective} from './directives/mouse-enter-leave.directive';
import {FooterComponent} from './components/footer/footer.component';
import {HeaderComponent} from './components/header/header.component';
import {ErrorPageComponent} from './components/error-page/error-page.component';
import {ToastComponent} from './components/toast/toast.component';
import {ServiceListComponent} from './components/service-list/service-list.component';
import {RouterModule} from '@angular/router';
import {TestDialogComponent} from './components/test-dialog/test-dialog.component';
import {DialogContainerComponent} from './components/dialog-container/dialog-container.component';
import {PortalModule} from '@angular/cdk/portal';
import {OverlayModule} from '@angular/cdk/overlay';
import {A11yModule} from '@angular/cdk/a11y';
import {DialogCloseDirective} from './directives/dialog-close.directive';
import {PredefinedDialogComponent} from './popups/predefined-dialog/predefined-dialog.component';
import {CdkTableModule} from '@angular/cdk/table';
import {ReactiveFormsModule} from '@angular/forms';
import {PageHeaderComponent} from './components/page-header/page-header.component';
import {LocalizationPopupComponent} from './popups/localization-popup/localization-popup.component';
import {FieldErrorMessageComponent} from './components/field-error-message/field-error-message.component';
import {BulkActionsComponent} from './components/bulk-actions/bulk-actions.component';
import {TooltipDirective} from './directives/tooltip.directive';
import {TabsListComponent} from './components/tabs/tabs-list.component';
import {TabComponent} from './components/tab/tab.component';
import {GridSearchComponent} from './components/grid-search/grid-search.component';
import {AsteriskIfRequiredDirective} from './directives/asterisk-if-required.directive';
import {LoadingComponent} from './components/loading/loading.component';
import {VersionComponent} from './components/version/version.component';
import {NgxMaskModule} from 'ngx-mask';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {FlipIconDirective} from './directives/flip-icon.directive';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {SidebarMenuItemListComponent} from './components/sidebar-menu-item-list/sidebar-menu-item-list.component';
import {MenuItemFilterPipe} from './pipes/menu-item-filter.pipe';
import {HighlightPipe} from './pipes/highlight.pipe';
import {NgSelectModule} from '@ng-select/ng-select';
import {AngularMyDatePickerModule} from 'angular-mydatepicker';
import {DateFixDirective} from './directives/date-fix.directive';
import {AttachmentListComponent} from './components/attachment-list/attachment-list.component';
import {TrimInputDirective} from './directives/trim-input.directive';

import { ValidationClassesDirective } from './directives/validation-classes.directive';
import { DocumentsComponent } from './components/documents/documents.component';
import { ViewDocumentPopupComponent } from './popups/view-document-popup/view-document-popup.component';
import { UploadDocumentPopupComponent } from './popups/upload-document-popup/upload-document-popup.component';
import { RecommendationsComponent } from './components/recommendations/recommendations.component';
import { CommentsComponent } from './components/comments/comments.component';
import {CaseCommentPopupComponent} from './components/case-comment-popup/case-comment-popup.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective,
    ToastComponent,
    ServiceListComponent,
    TestDialogComponent,
    DialogContainerComponent,
    DialogCloseDirective,
    PredefinedDialogComponent,
    PageHeaderComponent,
    LocalizationPopupComponent,
    FieldErrorMessageComponent,
    BulkActionsComponent,
    TooltipDirective,
    TabsListComponent,
    TabComponent,
    GridSearchComponent,
    AsteriskIfRequiredDirective,
    LoadingComponent,
    VersionComponent,
    SidebarComponent,
    FlipIconDirective,
    SidebarMenuItemListComponent,
    MenuItemFilterPipe,
    HighlightPipe,
    DateFixDirective,
    AttachmentListComponent,
    TrimInputDirective,
    ValidationClassesDirective,
    DocumentsComponent,
    ViewDocumentPopupComponent,
    UploadDocumentPopupComponent,
    RecommendationsComponent,
    CommentsComponent,
    CaseCommentPopupComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    OverlayModule,
    PortalModule,
    A11yModule,
    CdkTableModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgScrollbarModule,
    NgSelectModule,
    AngularMyDatePickerModule
  ],
  exports: [
    NgScrollbarModule,
    CommonModule,
    OverlayModule,
    NgxMaskModule,
    PortalModule,
    A11yModule,
    CdkTableModule,
    ReactiveFormsModule,
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective,
    ToastComponent,
    ServiceListComponent,
    DialogCloseDirective,
    PredefinedDialogComponent,
    PageHeaderComponent,
    LocalizationPopupComponent,
    FieldErrorMessageComponent,
    BulkActionsComponent,
    TooltipDirective,
    TabsListComponent,
    TabComponent,
    GridSearchComponent,
    AsteriskIfRequiredDirective,
    LoadingComponent,
    VersionComponent,
    SidebarComponent,
    NgSelectModule,
    AngularMyDatePickerModule,
    DateFixDirective,
    AttachmentListComponent,
    TrimInputDirective,
    ValidationClassesDirective,
    DocumentsComponent,
    ViewDocumentPopupComponent,
    CaseCommentPopupComponent,
    CommentsComponent
  ]
})
export class SharedModule {

}
