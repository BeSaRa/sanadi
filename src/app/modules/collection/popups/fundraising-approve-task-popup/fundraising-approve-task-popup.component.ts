import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { WFResponseType } from "@app/enums/wfresponse-type.enum";
import { CommonUtils } from "@app/helpers/common-utils";
import { HasLicenseApproval } from "@app/interfaces/has-license-approval";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IWFResponse } from "@app/interfaces/i-w-f-response";
import { CollectionItem } from "@app/models/collection-item";
import { Fundraising } from "@app/models/fundraising";
import { DialogService } from "@app/services/dialog.service";
import { InboxService } from "@app/services/inbox.service";
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { Subject } from "rxjs";
import { takeUntil, exhaustMap, switchMap, tap, map, filter } from "rxjs/operators";
import { ApprovalFormComponent } from "../../shared/approval-form/approval-form.component";

@Component({
  selector: "fundraising-approve-task-popup",
  templateUrl: "./fundraising-approve-task-popup.component.html",
  styleUrls: ["./fundraising-approve-task-popup.component.scss"],
})
export class FundraisingApproveTaskPopupComponent implements OnInit {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: Fundraising;
  comment: FormControl = new FormControl();

  @ViewChild(ApprovalFormComponent, { static: true })
  approvalForm!: ApprovalFormComponent;

  constructor(
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      model: Fundraising;
      action: WFResponseType;
    },
    public lang: LangService
  ) {
    this.label = (CommonUtils.changeCamelToSnakeCase(this.data.action) +
      "_task") as unknown as keyof ILanguageKeys;
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
    this.listenToSave();
  }

  listenToSave(): void {
    this.approvalForm.saveInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((model: HasLicenseApproval) => {
        this.model = model as unknown as Fundraising;
      });
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((_) => this.approvalForm.saveApprovalInfo()))
      .pipe(map(_ => this.model.hasValidApprovalInfo()))
      .pipe(tap(valid => !valid && this.displayInvalidItemMessages()))
      .pipe(filter(valid => valid))
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

  private displayInvalidItemMessages() {
    this.dialog.error(
      this.lang.map
        .please_make_sure_that_you_filled_out_all_required_data_for_all_license
    );
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
