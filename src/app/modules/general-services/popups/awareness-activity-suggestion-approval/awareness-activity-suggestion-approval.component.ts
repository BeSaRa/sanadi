import { AffiliationRequestType } from '@app/enums/service-request-types';
import { IWFResponse } from '@contracts/i-w-f-response';
import { takeUntil, map, tap, filter, exhaustMap, switchMap } from 'rxjs/operators';
import { InboxService } from '@app/services/inbox.service';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from '@services/dialog.service';
import { AwarenessActivitySuggestion } from '@app/models/awareness-activity-suggestion';
import { LangService } from '@services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DateUtils } from '@helpers/date-utils';
import { DatepickerOptionsMap } from '@app/types/types';
import { Subject, of } from 'rxjs';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-awareness-activity-suggestion-approval',
  templateUrl: './awareness-activity-suggestion-approval.component.html',
  styleUrls: ['./awareness-activity-suggestion-approval.component.css']
})
export class AwarenessActivitySuggestionApprovalComponent implements OnInit {
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
