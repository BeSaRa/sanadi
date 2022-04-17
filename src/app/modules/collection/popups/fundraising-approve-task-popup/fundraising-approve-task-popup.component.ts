import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormControl} from "@angular/forms";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {CommonUtils} from "@app/helpers/common-utils";
import {HasLicenseApproval} from "@app/interfaces/has-license-approval";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {IWFResponse} from "@app/interfaces/i-w-f-response";
import {Fundraising} from "@app/models/fundraising";
import {DialogService} from "@app/services/dialog.service";
import {InboxService} from "@app/services/inbox.service";
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {Subject} from "rxjs";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {ApprovalFormComponent} from "../../shared/approval-form/approval-form.component";
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {CustomValidators} from '@app/validators/custom-validators';
import {LicenseDurationType} from '@app/enums/license-duration-type';
import {DateUtils} from '@app/helpers/date-utils';

@Component({
  selector: "fundraising-approve-task-popup",
  templateUrl: "./fundraising-approve-task-popup.component.html",
  styleUrls: ["./fundraising-approve-task-popup.component.scss"],
})
export class FundraisingApproveTaskPopupComponent implements OnInit, AfterViewInit {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: Fundraising;
  comment: FormControl = new FormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);

  @ViewChild(ApprovalFormComponent) approvalForm!: ApprovalFormComponent;

  constructor(private dialog: DialogService,
              private dialogRef: DialogRef,
              private toast: ToastService,
              private inboxService: InboxService,
              @Inject(DIALOG_DATA_TOKEN)
              public data: { model: Fundraising; action: WFResponseType; },
              public lang: LangService) {
    this.label = (CommonUtils.changeCamelToSnakeCase(this.data.action) + "_task") as unknown as keyof ILanguageKeys;
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
  }

  ngAfterViewInit() {
    this.listenToSave();
  }

  listenToSave(): void {
    this.approvalForm?.saveInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((model: HasLicenseApproval) => {
        this.model = model as unknown as Fundraising;
      });
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((_) => this.isCancelRequestType() ? null : this.approvalForm.saveApprovalInfo(true)))
      .pipe(map(_ => this.isCancelRequestType() ? true : this.model.hasValidApprovalInfo()))
      .pipe(tap(valid => !valid && this.displayInvalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(map(_ => this.isCancelRequestType() ? false : this.approvalForm && this.hasInvalidItemDateRange()))
      .pipe(tap(invalid => invalid && this.displayInvalidItemDurationMessage(this.approvalForm.minLicenseMonths, this.approvalForm.maxLicenseMonths)))
      .pipe(filter(invalid => !invalid))
      .pipe(map(_ => this.isCommentRequired() ? this.comment.invalid : false))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap((_) => this.model.save()))
      .pipe(
        switchMap((_) =>
          this.inboxService.takeActionOnTask(
            this.model.taskDetails.tkiid,
            this.getResponse(),
            this.model.service
          )
        )
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private displayInvalidFormMessage() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private displayInvalidItemDurationMessage(serviceMinDate: number, serviceMaxDate: number) {
    this.dialog.error(this.lang.map.msg_license_duration_diff_between_x_and_y_months.change({
      x: serviceMinDate,
      y: serviceMaxDate
    }));
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value
      ? {
        selectedResponse: this.response,
        comment: this.comment.value,
      }
      : {selectedResponse: this.response};
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === ServiceRequestTypes.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  private isPermanent(): boolean {
    return this.model.licenseDurationType === LicenseDurationType.PERMANENT;
  }

  private validateLicenseDateRange(startDate: string, endDate: string) {
    if (!this.isPermanent() && startDate) {
      let minLicenseMonths, maxLicenseMonths;
      this.approvalForm && (minLicenseMonths = this.approvalForm.minLicenseMonths);
      this.approvalForm && (maxLicenseMonths = this.approvalForm.maxLicenseMonths);

      if (!!minLicenseMonths && !!maxLicenseMonths && minLicenseMonths > 0 && maxLicenseMonths > 0) {
        let licenseDuration = DateUtils.getDifference(startDate, endDate, 'month');// (dayjs(endDate).diff(startDate, 'month'));
        return licenseDuration >= minLicenseMonths && licenseDuration <= maxLicenseMonths;
      }
      return true;
    }
    return true;
  }

  hasInvalidItemDateRange(): boolean {
    return !this.validateLicenseDateRange(DateUtils.getDateStringFromDate(this.model.licenseStartDate), DateUtils.getDateStringFromDate(this.model.licenseEndDate));
  }
}
