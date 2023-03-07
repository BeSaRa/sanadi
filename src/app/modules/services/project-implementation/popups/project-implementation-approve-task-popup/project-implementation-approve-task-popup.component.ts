import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {WFResponseType} from "@enums/wfresponse-type.enum";
import {UntypedFormControl} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";
import {DialogService} from "@services/dialog.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {ToastService} from "@services/toast.service";
import {InboxService} from "@services/inbox.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {LangService} from "@services/lang.service";
import {CommonUtils} from "@helpers/common-utils";
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {IWFResponse} from "@contracts/i-w-f-response";
import {ServiceRequestTypes} from "@enums/service-request-types";
import {
  ApprovalFormMonthlyComponent
} from "@app/shared/components/approval-form-monthly/approval-form-monthly.component";
import {ProjectImplementation} from "@models/project-implementation";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'project-implementation-approve-task-popup',
  templateUrl: './project-implementation-approve-task-popup.component.html',
  styleUrls: ['./project-implementation-approve-task-popup.component.scss']
})
export class ProjectImplementationApproveTaskPopupComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;
  disableLicenseStartDate: boolean = false;
  model: ProjectImplementation;
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  @ViewChild(ApprovalFormMonthlyComponent) approvalForm!: ApprovalFormMonthlyComponent;

  constructor(
    private dialog: DialogService,
    private toast: ToastService,
    private dialogRef: DialogRef,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: ProjectImplementation,
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
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }

    this.disableLicenseStartDate = this.model.requestType === ServiceRequestTypes.EXTEND
  }

  ngAfterViewInit() {
    this.listenToSaveApprovalForm();
  }

  private listenToAction() {
    // noinspection DuplicatedCode
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((_) => this.isCancelRequestType() ? null : this.approvalForm.saveApprovalInfo()))
      .pipe(map(_ => this.isCancelRequestType() ? true : this.model.hasValidApprovalInfo()))
      .pipe(tap(valid => !valid && this.displayInvalidFormMessage()))
      .pipe(filter(valid => valid))
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private displayInvalidFormMessage() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }

  private listenToSaveApprovalForm() {
    this.approvalForm?.saveInfo
      .pipe(takeUntil(this.destroy$))
      .subscribe((model) => {
        this.model = (model as unknown as ProjectImplementation)
      })
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === ServiceRequestTypes.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }
}
