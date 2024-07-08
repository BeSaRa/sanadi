import { AfterViewInit, Component, Inject, NgZone, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { Subject } from 'rxjs';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DIALOG_DATA_TOKEN } from '../../tokens/tokens';
import { IESComponent } from '@app/interfaces/iescomponent';
import { SaveTypes } from '@app/enums/save-types';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogRef } from '../../models/dialog-ref';
import { take } from 'rxjs/operators';
import { OpenFrom } from '@app/enums/open-from.enum';
import { CaseModel } from '@app/models/case-model';
import { QueryResult } from '@app/models/query-result';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InternalProjectLicenseService } from '@app/services/internal-project-license.service';
import { EmployeeService } from '@app/services/employee.service';
import { InternalProjectLicense } from '@app/models/internal-project-license';
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'case-viewer-popup',
  templateUrl: './case-viewer-popup.component.html',
  styleUrls: ['./case-viewer-popup.component.scss']
})
export class CaseViewerPopupComponent implements OnInit, AfterViewInit {

  @ViewChild('template', {read: ViewContainerRef, static: true})
  container!: ViewContainerRef;

  viewInit: Subject<void> = new Subject<void>();
  _component!: IESComponent<CaseModel<any, any>>;
  openedFrom!: OpenFrom;

  canShowMatrixNotification: boolean = false;
  matrixNotificationType!: 'success' | 'danger';
  matrixNotificationMsg!: string;

  set component(component: IESComponent<CaseModel<any, any>>) {
    this.zone.onStable
      .pipe(take(1))
      .subscribe(() => {
        this._component = component;
      });
  }

  get component(): IESComponent<CaseModel<any, any>> {
    return this._component;
  }

  saveTypes: typeof SaveTypes = SaveTypes;
  actions: IMenuItem<CaseModel<any, any> | QueryResult>[] = [];
  // the model that the user clicked on it
  model: CaseModel<any, any> | QueryResult;
  // the model that we load to display inside the viewer
  loadedModel: CaseModel<any, any> | QueryResult;

  constructor(@Inject(DIALOG_DATA_TOKEN)
              public data: {
                key: keyof ILanguageKeys,
                model: any,
                actions: IMenuItem<CaseModel<any, any> | QueryResult>[],
                openedFrom: OpenFrom,
                loadedModel: any,
                componentService: BaseGenericEService<any>
              },
              private zone: NgZone,
              private dialogRef: DialogRef,
              private empService: EmployeeService,
              public lang: LangService) {
    this.model = this.data.model;
    this.openedFrom = this.data.openedFrom;
    this.loadedModel = this.data.loadedModel;
  }

  ngOnInit(): void {
    this.actions = this.data.actions.filter((action) => this.filterAction(action));
    this.checkForFinalApproveByMatrixNotification();
  }

  ngAfterViewInit(): void {

    this.viewInit.next();
    this.viewInit.complete();
    this.viewInit.unsubscribe();
  }

  displayLabel(action: IMenuItem<CaseModel<any, any> | QueryResult>): string {
    return typeof action.label === 'function' ? action.label(this.model) : this.lang.map[action.label as unknown as keyof ILanguageKeys];
  }

  get internalProjectLicenseService(): InternalProjectLicenseService | undefined {
    if (!this.data.componentService) {
      return undefined;
    }

    return (this.data.componentService as unknown as InternalProjectLicenseService);
  }

  checkForFinalApproveByMatrixNotification(): void {
    let requestModel = (this.loadedModel as unknown as InternalProjectLicense),
      canShowNotification: boolean = (this.loadedModel.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE)
        && (this.openedFrom === OpenFrom.USER_INBOX || (this.openedFrom === OpenFrom.TEAM_INBOX && requestModel.taskDetails.isClaimed()))
        && !!this.internalProjectLicenseService
        && (this.empService.isLicensingManager() || this.empService.isLicensingChiefManager());

    this.canShowMatrixNotification = canShowNotification;

    if (canShowNotification) {
      this.internalProjectLicenseService!.checkFinalApproveNotificationByMatrix(this.loadedModel.getCaseId())
        .subscribe((result: boolean) => {
          this.matrixNotificationType = result ? 'success' : 'danger';
          if (this.empService.isLicensingManager()) {
            this.matrixNotificationMsg = result ? this.lang.map.based_on_matrix_should_not_send_to_general_manager : this.lang.map.based_on_matrix_should_send_to_general_manager;
            return;
          }
          this.matrixNotificationMsg = result ? this.lang.map.msg_success_final_approve_task_based_on_matrix_notification : this.lang.map.msg_fail_final_approve_task_based_on_matrix_notification;
        });
    }
  }

  takeAction(action: IMenuItem<CaseModel<any, any> | QueryResult>): void {
    action.onClick && action.onClick(this.model, this.dialogRef, this.loadedModel, this.component, this);
  }

  private filterAction(action: IMenuItem<CaseModel<any, any> | QueryResult>) {
    return action.type === 'action' && (!action.show ? true : action.show(this.model));
  }

  saveCase(): void {
    if (!this.isSaveAvailable()) {
      return;
    }
    this.component?.save?.next(this.saveTypes.FINAL);
  }

  hideAction(action: IMenuItem<CaseModel<any, any> | QueryResult>): boolean {
    if (action.data?.hasOwnProperty('hideFromViewer')) {
      return typeof action.data?.hideFromViewer === 'function' ? action.data.hideFromViewer(this.loadedModel, this.model) : action.data?.hideFromViewer!;
    } else {
      return false;
    }
  }

  validateForm(): void {
    this.component && this.component.formValidity$?.next('case-viewer');
  }

  isSaveAvailable(): boolean {
    return this.component && !this.component.readonly;
  }

  isValidateAvailable(): boolean {
    return this.component && !this.component.readonly;
  }
}
