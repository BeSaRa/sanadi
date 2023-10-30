import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { DialogService } from '@app/services/dialog.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'financial-analysis-approve-popup',
  templateUrl: 'financial-analysis-approve-popup.component.html',
  styleUrls: ['financial-analysis-approve-popup.component.scss']
})
export class FinancialAnalysisApprovePopupComponent implements OnInit, AfterViewInit {
  comment: UntypedFormControl = new UntypedFormControl('', [
    CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),
  ]);
  response: WFResponseType = WFResponseType.APPROVE;
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();
  approvalForm!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
  };
  private destroy$: Subject<any> = new Subject();

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    model: FinancialTransferLicensing,
    action: WFResponseType,
  },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private fb: UntypedFormBuilder) {
    this.label = (CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys;
    this.response = this.data.action;
    this.approvalForm = this.fb.group(this.data.model.buildApprovalForm(true));
  }

  ngOnInit() {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([
        CustomValidators.required,
        CustomValidators.maxLength(
          CustomValidators.defaultLengths.EXPLANATIONS
        ),
      ]);
    }
  }

  ngAfterViewInit(): void {

    const date = DateUtils.changeDateToDatepicker(this.data.model.followUpDate)
    this.followupDate.patchValue(date);
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.comment.invalid || this.approvalForm.invalid))
      .pipe(
        tap(
          (invalid) =>
            invalid &&
            this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)
        )
      )
      .pipe(filter((invalid) => !invalid))
      .pipe(
        exhaustMap((_) => {
          Object.assign(this.data.model, this.approvalForm.value);
            return this.data.model.save();
        })
      )
      .pipe(
        switchMap((_) =>
          this.inboxService.takeActionOnTask(
            this.data.model.taskDetails.tkiid,
            this.getResponse(),
            this.data.model.service
          )
        )
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value
      ? {
        selectedResponse: this.response,
        comment: this.comment.value,
      }
      : { selectedResponse: this.response };
  }


  private isCommentRequired(): boolean {
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get followupDate(): UntypedFormControl {
    return this.approvalForm.get('followUpDate') as UntypedFormControl
  }
}
