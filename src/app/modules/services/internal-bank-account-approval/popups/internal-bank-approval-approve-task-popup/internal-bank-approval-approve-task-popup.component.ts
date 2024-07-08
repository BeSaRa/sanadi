import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { UntypedFormControl } from '@angular/forms';
import { DialogService } from '@services/dialog.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@services/toast.service';
import { InboxService } from '@services/inbox.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@services/lang.service';
import { CommonUtils } from '@helpers/common-utils';
import { exhaustMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IWFResponse } from '@contracts/i-w-f-response';
import { InternalBankAccountApproval } from '@models/internal-bank-account-approval';
import { IKeyValue } from '@contracts/i-key-value';
import { DateUtils } from '@helpers/date-utils';

@Component({
  selector: 'internal-bank-approval-approve-task-popup',
  templateUrl: './internal-bank-approval-approve-task-popup.component.html',
  styleUrls: ['./internal-bank-approval-approve-task-popup.component.scss']
})
export class InternalBankApprovalApproveTaskPopupComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();
  label: keyof ILanguageKeys;

  selectedLicense!: InternalBankAccountApproval | null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: InternalBankAccountApproval;
  comment: UntypedFormControl = new UntypedFormControl();
  followUpDate: UntypedFormControl = new UntypedFormControl();

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' })
  };

  constructor(
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: InternalBankAccountApproval,
      action: WFResponseType
    },
    public lang: LangService,
  ) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.selectedLicense = this.model;
    this.followUpDate.patchValue(DateUtils.changeDateToDatepicker(this.model.followUpDate));
    this.listenToAction();
  }

  // setSelectedLicense({item, index}: { item: HasLicenseApproval, index: number }) {
  //   this.selectedLicense = item;
  //   this.selectedIndex = (++index); // add one to the selected inbox to avoid the  check false value
  // }

  saveLicenseInfo(license: InternalBankAccountApproval) {
    this.model.followUpDate = license.followUpDate;
  }

  formCancel() {
    this.selectedLicense = null;
    this.selectedIndex = false;
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        this.model.followUpDate = DateUtils.getDateStringFromDate(this.followUpDate.value);
        return this.data.model.save();
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  private displayInvalidItemMessages() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }
}
