import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { CommonUtils } from "@app/helpers/common-utils";
import { DateUtils } from "@app/helpers/date-utils";
import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IWFResponse } from "@app/interfaces/i-w-f-response";
import { ShippingApproval } from "@app/models/shipping-approval";
import { InboxService } from "@app/services/inbox.service";
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { Subject } from "rxjs";
import { exhaustMap, switchMap, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "shipping-approve-task-pop-up",
  templateUrl: "./shipping-approve-task-pop-up.component.html",
  styleUrls: ["./shipping-approve-task-pop-up.component.scss"],
})
export class ShippingApproveTaskPopUpComponent implements OnInit {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: ShippingApproval;
  comment: FormControl = new FormControl();
  form!: FormGroup;

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      model: ShippingApproval;
      action: WFResponseType;
    },
    public lang: LangService
  ) {
    this.label = (CommonUtils.changeCamelToSnakeCase(this.data.action) +
      "_task") as unknown as keyof ILanguageKeys;
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAction();
    this.setFollowUpDateIfExists();
  }

  setFollowUpDateIfExists() {
    if (!this.model.followUpDate) {
      return;
    }
    this.form
      .get("followUpDate")
      ?.setValue(DateUtils.changeDateToDatepicker(this.model.followUpDate));
  }

  private buildForm(): void {
    this.form = this.fb.group(new ShippingApproval().buildApprovalForm(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((_) => this.setFollowUpDateValueInModel()))
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

  isCancelRequestType(): boolean {
    return this.data.model.requestType === ServiceRequestTypes.CANCEL;
  }

  setFollowUpDateValueInModel(): void {
    const form = { ...this.form.getRawValue() };
    if (!form.followUpDate) {
      return;
    }
    this.model.followUpDate = form.followUpDate
      ? DateUtils.getDateStringFromDate(form.followUpDate)
      : "";
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value
      ? {
          selectedResponse: this.response,
          comment: this.comment.value,
        }
      : { selectedResponse: this.response };
  }
}
