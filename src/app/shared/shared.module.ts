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
import {PredefinedDialogComponent} from './components/predefined-dialog/predefined-dialog.component';


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
    PredefinedDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    OverlayModule,
    PortalModule,
    A11yModule
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    ErrorPageComponent,
    MouseEnterLeaveDirective,
    ToastComponent,
    ServiceListComponent,
    DialogCloseDirective,
    PredefinedDialogComponent
  ]
})
export class SharedModule {
}
