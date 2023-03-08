import { DialogService } from '@services/dialog.service';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { CommonUtils } from '@helpers/common-utils';
import { InboxService } from '@services/inbox.service';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '../../../../../shared/models/dialog-ref';
import { LangService } from '@services/lang.service';
import { GeneralProcessNotification } from '@models/general-process-notification';
import { DIALOG_DATA_TOKEN } from '../../../../../shared/tokens/tokens';
import { DateUtils } from '@helpers/date-utils';
import { DatepickerOptionsMap } from '@app-types/types';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { CustomValidators } from '../../../../../validators/custom-validators';
import { switchMap, exhaustMap, takeUntil, map, tap, filter } from 'rxjs/operators';
import { IWFResponse } from '@contracts/i-w-f-response';
import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-general-process-notification-approval-popup',
  templateUrl: './general-process-notification-approval-popup.component.html',
  styleUrls: ['./general-process-notification-approval-popup.component.scss']
})
export class GeneralProcessNotificationApprovalPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  label: keyof ILanguageKeys;
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
    private dialogRef: DialogRef,
    private dialog: DialogService,
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
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.comment.invalid || this.approvalForm.invalid))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        Object.assign(this.data.model, this.approvalForm.value)
        return this.data.model.save()
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
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
