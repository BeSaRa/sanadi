import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap, FollowUpDateModels } from '@app/types/types';
import { of, Subject } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { DialogService } from '@app/services/dialog.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@app/services/toast.service';
import { InboxService } from '@app/services/inbox.service';
import { CommonUtils } from '@app/helpers/common-utils';
import { CustomValidators } from '@app/validators/custom-validators';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { AffiliationRequestType } from '@app/enums/service-request-types';

@Component({
  selector: 'app-financial-transfer-licensing-approve-popup',
  templateUrl: './financial-transfer-licensing-approve-popup.component.html',
  styleUrls: ['./financial-transfer-licensing-approve-popup.component.scss']
})
export class FinancialTransferLicensingApprovePopupComponent implements OnInit {

  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  private destroy$: Subject<any> = new Subject();
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: FinancialTransferLicensing,
      action: WFResponseType
    },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private fb: UntypedFormBuilder
  ) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.approvalForm = this.fb.group(this.data.model.buildApprovalForm(true))
  }

  ngOnInit() {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.isCommentRequired() ? this.comment.invalid : false))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        if (!this.isCancelRequestType()) {
          Object.assign(this.data.model, this.approvalForm.value)
          return this.data.model.save()
        }
        return of(true)
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }
  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
  isCancelRequestType(): boolean {
    return this.data.model.requestType === AffiliationRequestType.CANCEL;
  }
  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
