import { AffiliationRequestType } from './../../../../enums/service-request-types';
import { InboxService } from './../../../../services/inbox.service';
import { ToastService } from './../../../../services/toast.service';
import { DialogRef } from './../../../../shared/models/dialog-ref';
import { DialogService } from './../../../../services/dialog.service';
import { LangService } from './../../../../services/lang.service';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { DIALOG_DATA_TOKEN } from './../../../../shared/tokens/tokens';
import { DateUtils } from './../../../../helpers/date-utils';
import { DatepickerOptionsMap } from './../../../../types/types';
import { WFResponseType } from './../../../../enums/wfresponse-type.enum';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { CustomValidators } from './../../../../validators/custom-validators';
import { switchMap, exhaustMap, filter, tap, map, takeUntil } from 'rxjs/operators';
import { IWFResponse } from './../../../../interfaces/i-w-f-response';
import { Component, Inject, OnInit } from '@angular/core';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-general-process-notification-approval',
  templateUrl: './general-process-notification-approval.component.html',
  styleUrls: ['./general-process-notification-approval.component.scss']
})
export class GeneralProcessNotificationApprovalComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  private destroy$: Subject<any> = new Subject();
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: GeneralProcessNotification,
      action: WFResponseType
    },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private fb: UntypedFormBuilder
  ) {
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
