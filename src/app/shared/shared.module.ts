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
import {SidebarMenuItemListComponent} from './components/sidebar-menu-item-list/sidebar-menu-item-list.component';
import {MenuItemFilterPipe} from './pipes/menu-item-filter.pipe';
import {HighlightPipe} from './pipes/highlight.pipe';
import {NgSelectModule} from '@ng-select/ng-select';
import {AngularMyDatePickerModule} from 'angular-mydatepicker';
import {DateFixDirective} from './directives/date-fix.directive';
import {AttachmentListComponent} from './components/attachment-list/attachment-list.component';
import {TrimInputDirective} from './directives/trim-input.directive';
import {ValidationClassesDirective} from './directives/validation-classes.directive';
import {DocumentsComponent} from './components/documents/documents.component';
import {ViewDocumentPopupComponent} from './popups/view-document-popup/view-document-popup.component';
import {UploadDocumentPopupComponent} from './popups/upload-document-popup/upload-document-popup.component';
import {RecommendationsComponent} from './components/recommendations/recommendations.component';
import {CaseCommentPopupComponent} from './popups/case-comment-popup/case-comment-popup.component';
import {CommentsComponent} from './components/comments/comments.component';
import {TableComponent} from './components/table/table.component';
import {SortableTableDirective} from './directives/sortable-table.directive';
import {PaginatorComponent} from './components/paginator/paginator.component';
import {SortableHeaderComponent} from './components/sortable-header/sortable-header.component';
import {DocumentsPopupComponent} from './popups/documents-popup/documents-popup.component';
import {ActionRegistryPopupComponent} from './popups/action-registry-popup/action-registry-popup.component';
import {LogViewerComponent} from './components/log-viewer/log-viewer.component';
import {IndeterminateDirective} from './directives/indeterminate.directive';
import {SendToComponent} from './popups/send-to-user-popup/send-to.component';
import {ContextMenuModule} from '../modules/context-menu/context-menu.module';
import {ActionWithCommentPopupComponent} from './popups/action-with-comment-popup/action-with-comment-popup.component';
import {RecommendationPopupComponent} from './popups/recommendation-popup/recommendation-popup.component';
import {
  ManageRecommendationPopupComponent
} from './popups/manage-recommendation-popup/manage-recommendation-popup.component';
import {ManageCommentPopupComponent} from './popups/manage-comment-popup/manage-comment-popup.component';
import {CaseViewerPopupComponent} from './popups/case-viewer-popup/case-viewer-popup.component';
import {LocalizationKeyExistsDirective} from '../validators/localization-key-exists.directive';
import {FullscreenBtnDirective} from './directives/fullscreen-btn.directive';
import {CommentHistoryPopupComponent} from './popups/comment-history-popup/comment-history-popup.component';
import {ViewerCaseInfoComponent} from './components/viewer-case-info/viewer-case-info.component';
import {FilterRetiredStatusPipe} from './pipes/filter-retired-status.pipe';
import {CustomTermPopupComponent} from './popups/custom-term-popup/custom-term-popup.component';
import {
  RequestRecommendationsComponent
} from '@app/shared/components/request-recommendations/request-recommendations.component';
import {ValidationGroupClassesDirective} from './directives/validation-group-classes.directive';
import {GroupErrorMessageComponent} from './components/group-error-message/group-error-message.component';
import {NgOptionHighlightModule} from '@ng-select/ng-option-highlight';
import {SendToMultipleComponent} from './popups/send-to-multiple/send-to-multiple.component';
import {AttachmentsComponent} from './components/attachments/attachments.component';
import {OnlyNumbersDirective} from './directives/only-numbers.directive';
import {SurveyViewComponent} from './components/survey-view/survey-view.component';
import {ViewSurveyPopupComponent} from './popups/view-survey-popup/view-survey-popup.component';
import {ViewTraineeSurveyComponent} from './popups/view-trainee-survey/view-trainee-survey.component';
import {FileUploaderComponent} from './components/file-uploader/file-uploader.component';
import {TableHeaderComponent} from './components/table-header/table-header.component';
import {WorkItemStatusComponent} from './components/work-item-status/work-item-status.component';
import {InboxGridActionsComponent} from './components/inbox-grid-actions/inbox-grid-actions.component';
import {ReadUnreadDirective} from './directives/read-unread.directive';
import {RiskStatusDirective} from './directives/risk-status.directive';
import {
  EServiceComponentWrapperComponent
} from "@app/shared/components/e-service-component-wrapper/e-service-component-wrapper.component";
import {CaseInfoComponent} from './components/case-info/case-info.component';
import {GridActionsComponent} from './components/grid-actions/grid-actions.component';
import {StepCheckListComponent} from './components/step-check-list/step-check-list.component';
import {LangLoaderComponent} from './components/lang-loader/lang-loader.component';
import {
  ApprovalFormMonthlyComponent
} from "@app/shared/components/approval-form-monthly/approval-form-monthly.component";

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
    ViewDocumentPopupComponent,
    UploadDocumentPopupComponent,
    DocumentsComponent,
    CommentsComponent,
    RecommendationsComponent,
    CaseCommentPopupComponent,
    TableComponent,
    SortableTableDirective,
    PaginatorComponent,
    SortableHeaderComponent,
    DocumentsPopupComponent,
    ActionRegistryPopupComponent,
    LogViewerComponent,
    IndeterminateDirective,
    SendToComponent,
    ActionWithCommentPopupComponent,
    RecommendationPopupComponent,
    ManageRecommendationPopupComponent,
    ManageCommentPopupComponent,
    CaseViewerPopupComponent,
    LocalizationKeyExistsDirective,
    FullscreenBtnDirective,
    CommentHistoryPopupComponent,
    ViewerCaseInfoComponent,
    FilterRetiredStatusPipe,
    RequestRecommendationsComponent,
    ValidationGroupClassesDirective,
    GroupErrorMessageComponent,
    SendToMultipleComponent,
    CustomTermPopupComponent,
    AttachmentsComponent,
    OnlyNumbersDirective,
    SurveyViewComponent,
    ViewSurveyPopupComponent,
    ViewTraineeSurveyComponent,
    FileUploaderComponent,
    TableHeaderComponent,
    WorkItemStatusComponent,
    InboxGridActionsComponent,
    ReadUnreadDirective,
    RiskStatusDirective,
    EServiceComponentWrapperComponent,
    CaseInfoComponent,
    GridActionsComponent,
    StepCheckListComponent,
    LangLoaderComponent,
    LangLoaderComponent,
    ApprovalFormMonthlyComponent
  ],
  imports: [
    CommonModule,
    ContextMenuModule,
    RouterModule.forChild([]),
    OverlayModule,
    PortalModule,
    A11yModule,
    CdkTableModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    NgOptionHighlightModule,
    AngularMyDatePickerModule,
  ],
  exports: [
    ContextMenuModule,
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
    NgOptionHighlightModule,
    AngularMyDatePickerModule,
    DateFixDirective,
    AttachmentListComponent,
    TrimInputDirective,
    ValidationClassesDirective,
    DocumentsComponent,
    CommentsComponent,
    ViewDocumentPopupComponent,
    CaseCommentPopupComponent,
    TableComponent,
    SortableTableDirective,
    SortableHeaderComponent,
    PaginatorComponent,
    IndeterminateDirective,
    RecommendationsComponent,
    LocalizationKeyExistsDirective,
    FullscreenBtnDirective,
    ManageCommentPopupComponent,
    FilterRetiredStatusPipe,
    RequestRecommendationsComponent,
    ValidationGroupClassesDirective,
    GroupErrorMessageComponent,
    AttachmentsComponent,
    OnlyNumbersDirective,
    LogViewerComponent,
    SurveyViewComponent,
    FileUploaderComponent,
    TableHeaderComponent,
    WorkItemStatusComponent,
    InboxGridActionsComponent,
    ReadUnreadDirective,
    RiskStatusDirective,
    EServiceComponentWrapperComponent,
    GridActionsComponent,
    LangLoaderComponent,
    ApprovalFormMonthlyComponent
  ]
})
export class SharedModule {

}
