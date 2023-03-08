import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IWFResponse} from '@contracts/i-w-f-response';
import {DialogService} from '@services/dialog.service';
import {InboxService} from '@services/inbox.service';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {FollowUpDateModels} from '@app/types/types';
import {Subject} from 'rxjs';
import {exhaustMap, filter, switchMap, takeUntil, tap} from 'rxjs/operators';


@Component({
  selector: 'follow-up-date-approve-popup',
  templateUrl: './follow-up-date-approve-popup.component.html',
  styleUrls: ['./follow-up-date-approve-popup.component.scss']
})
export class FollowupDateApprovePopupComponent implements OnInit {

  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  selectedLicense!: FollowUpDateModels | null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;
  model: FollowUpDateModels;
  comment: UntypedFormControl = new UntypedFormControl();
  followUpDate: UntypedFormControl = new UntypedFormControl();
  organizationId: UntypedFormControl = new UntypedFormControl();
  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' })
  };

  constructor(
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: FollowUpDateModels;
      action: WFResponseType;
    },
    public lang: LangService
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
  saveLicenseInfo(license: FollowUpDateModels) {
    this.model.followUpDate = license.followUpDate;
    this.model.organizationId = license.organizationId;
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
        return this.model.save();
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
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
