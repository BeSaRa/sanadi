import {Component, Inject} from '@angular/core';
import {LangService} from '@services/lang.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@contracts/i-dialog-data';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {Observable} from 'rxjs';
import {ExternalUserUpdateRequestService} from '@services/external-user-update-request.service';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

@Component({
  selector: 'external-user-update-approval-popup',
  templateUrl: './external-user-update-approval-popup.component.html',
  styleUrls: ['./external-user-update-approval-popup.component.scss']
})
export class ExternalUserUpdateApprovalPopupComponent extends AdminGenericDialog<ExternalUserUpdateRequest> {
  form!: UntypedFormGroup;

  operation: OperationTypes;
  model: ExternalUserUpdateRequest;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ExternalUserUpdateRequest>,
              public lang: LangService,
              public service: ExternalUserUpdateRequestService,
              private dialogService: DialogService,
              public dialogRef: DialogRef,
              private toast: ToastService,
              public fb: UntypedFormBuilder) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  get popupTitle(): string {
    return this.lang.map.view;
  }

  initPopup(): void {
    throw new Error('Method not implemented.');
  }

  destroyPopup(): void {
    throw new Error('Method not implemented.');
  }

  afterSave(model: ExternalUserUpdateRequest, dialogRef: DialogRef): void {
    throw new Error('Method not implemented.');
  }

  beforeSave(model: ExternalUserUpdateRequest, form: UntypedFormGroup): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  prepareModel(model: ExternalUserUpdateRequest, form: UntypedFormGroup): ExternalUserUpdateRequest | Observable<ExternalUserUpdateRequest> {
    const value = new ExternalUserUpdateRequest().clone({
      ...model,
      requestStatus: ExternalUserUpdateRequestStatusEnum.IN_PROGRESS,
      notes: ''
    });
    return value;
  }

  saveFail(error: Error): void {
    throw new Error('Method not implemented.');
  }

  buildForm(): void {
    throw new Error('Method not implemented.');
  }

  saveRequest($event?: MouseEvent) {
    $event?.preventDefault();
    if (!this.service.canEditUserRequest()) {
      return;
    }

  }

  acceptRequest($event?: MouseEvent) {
    $event?.preventDefault();
    if (!this.service.canAcceptUserRequest()) {
      return;
    }
    this.service.acceptRequest(this.model)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_accept_x_success);
        this.dialogRef.close(result);
      });
  }

  rejectRequest($event?: MouseEvent) {
    $event?.preventDefault();
    if (!this.service.canRejectUserRequest()) {
      return;
    }
    this.service.rejectRequestWithReason(this.model)
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.toast.success(this.lang.map.msg_reject_x_success);
        this.dialogRef.close(result);
      });
  }
}
