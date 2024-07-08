import { CollectionRequestType } from '@enums/service-request-types';
import { IWFResponse } from '@contracts/i-w-f-response';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { InboxService } from '@services/inbox.service';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from '@services/dialog.service';
import { AwarenessActivitySuggestion } from '@models/awareness-activity-suggestion';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DateUtils } from '@helpers/date-utils';
import { DatepickerOptionsMap } from '@app/types/types';
import { of, Subject } from 'rxjs';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-awareness-activity-suggestion-approval-popup',
  templateUrl: './awareness-activity-suggestion-approval-popup.component.html',
  styleUrls: ['./awareness-activity-suggestion-approval-popup.component.css']
})
export class AwarenessActivitySuggestionApprovalPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  private destroy$: Subject<void> = new Subject();
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: AwarenessActivitySuggestion,
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
      .pipe(map(_ =>
        this.comment.invalid || (!this.isCancelRequestType()
          ? this.approvalForm.invalid
          : false)))
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
    return this.data.model.requestType === CollectionRequestType.CANCEL;
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
