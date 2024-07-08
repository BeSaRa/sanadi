import {Component, Inject, OnInit} from "@angular/core";
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {ServiceRequestTypes} from "@enums/service-request-types";
import {WFResponseType} from "@enums/wfresponse-type.enum";
import {CommonUtils} from "@helpers/common-utils";
import {DateUtils} from "@helpers/date-utils";
import {IKeyValue} from "@contracts/i-key-value";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {IWFResponse} from "@contracts/i-w-f-response";
import {CustomsExemptionRemittance} from "@models/customs-exemption-remittance";
import {DialogService} from "@services/dialog.service";
import {InboxService} from "@services/inbox.service";
import {LangService} from "@services/lang.service";
import {ToastService} from "@services/toast.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {CustomValidators} from "@app/validators/custom-validators";
import {Subject} from "rxjs";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";

@Component({
  selector: "customs-exemption-approve-task-popup",
  templateUrl: "./customs-exemption-approve-task-popup.component.html",
  styleUrls: ["./customs-exemption-approve-task-popup.component.scss"],
})
export class CustomsExemptionApproveTaskPopupComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: CustomsExemptionRemittance;
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  form!: UntypedFormGroup;

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
  };

  constructor(
    private dialog: DialogService,
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      model: CustomsExemptionRemittance;
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
    if(!this.isCancelRequestType()){
      this.setFollowUpDateIfExists();
    }
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
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
    this.form = this.fb.group(new CustomsExemptionRemittance().buildApprovalForm(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.isCommentRequired() ? this.comment.invalid : false))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
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

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  setFollowUpDateValueInModel(): void {
    if(this.isCancelRequestType()){
     return;
    }
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
