import { CommonUtils } from './../../../../helpers/common-utils';
import { LangType } from './../../../../types/types';
import { ILanguageKeys } from './../../../../interfaces/i-language-keys';
import { NpoManagement } from './../../../../models/npo-management';
import { DatepickerOptionsMap } from '@app/types/types';
import { DateUtils } from '@app/helpers/date-utils';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DialogService } from '@app/services/dialog.service';
import { takeUntil, map, tap, filter, exhaustMap, switchMap } from 'rxjs/operators';
import { CustomValidators } from '@app/validators/custom-validators';
import { LangService } from '@services/lang.service';
import { Component, Inject, OnInit } from '@angular/core';
import { Subject, of } from 'rxjs';
import { InboxService } from '@app/services/inbox.service';
import { AffiliationRequestType } from '@app/enums/service-request-types';

@Component({
  selector: 'app-npo-management-approve-popup',
  templateUrl: './npo-management-approve-popup.component.html',
  styleUrls: ['./npo-management-approve-popup.component.scss']
})
export class NpoManagementApprovePopupComponent implements OnInit {
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
      model: NpoManagement,
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
          console.log({...this.data.model})
          return this.data.model.save()
        }
        return of(true)
      }))
      // .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        // this.dialogRef.close(true);
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
