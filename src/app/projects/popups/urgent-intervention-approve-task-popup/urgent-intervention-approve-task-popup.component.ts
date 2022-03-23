import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DialogService} from "@app/services/dialog.service";
import {ToastService} from "@app/services/toast.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {InboxService} from "@app/services/inbox.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {WFResponseType} from "@app/enums/wfresponse-type.enum";
import {LangService} from "@app/services/lang.service";
import {CommonUtils} from "@app/helpers/common-utils";
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {Subject} from "rxjs";
import {FormControl} from "@angular/forms";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {IWFResponse} from "@app/interfaces/i-w-f-response";
import {UrgentInterventionLicense} from "@app/models/urgent-intervention-license";
import {
  ApprovalFormMonthlyComponent
} from "@app/shared/components/approval-form-monthly/approval-form-monthly.component";


@Component({
  selector: 'urgent-intervention-approve-task-popup',
  templateUrl: './urgent-intervention-approve-task-popup.component.html',
  styleUrls: ['./urgent-intervention-approve-task-popup.component.scss']
})
export class UrgentInterventionApproveTaskPopupComponent implements OnInit {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: UrgentInterventionLicense;
  comment: FormControl = new FormControl();

  @ViewChild(ApprovalFormMonthlyComponent, {static: true})
  approvalForm!: ApprovalFormMonthlyComponent;

  constructor(
    private dialog: DialogService,
    private toast: ToastService,
    private dialogRef: DialogRef,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: UrgentInterventionLicense,
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
    this.listenToAction();
    this.listenToSaveApprovalForm();
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.approvalForm.saveApprovalInfo()))
      .pipe(map(_ => !this.model.hasValidApprovalInfo()))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => this.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
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
    } : {selectedResponse: this.response};
  }

  private listenToSaveApprovalForm() {
    this.approvalForm
      .saveInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this.model = (model as unknown as UrgentInterventionLicense)
      })
  }
}
