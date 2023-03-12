import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { DatepickerOptionsMap } from '@app/types/types';
import { DateUtils } from '@helpers/date-utils';
import { Subject } from 'rxjs';
import { EmploymentRequestType } from '@enums/service-request-types';
import { exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { IWFResponse } from '@contracts/i-w-f-response';
import { CustomValidators } from '@app/validators/custom-validators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { InboxService } from '@services/inbox.service';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ContractTypes } from '@enums/contract-types.enum';
import { Employee } from '@models/employee';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Employment } from "@models/employment";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { EmploymentCategory } from '@enums/employment-category.enum';

@Component({
  selector: 'employment-approve',
  templateUrl: './employment-approve.component.html',
  styleUrls: ['./employment-approve.component.scss']
})
export class EmploymentApproveComponent implements OnInit, OnDestroy {
  employees: Partial<Employee>[] = [];
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject();
  form!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    licenseEndDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
  };
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: Employment,
      action: WFResponseType
    },
    private inboxService: InboxService,
    private fb: UntypedFormBuilder,
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService, private dialog: DialogService) {
    this.response = this.data.action;
    this.employees = data.model.employeeInfoDTOs;
  }
  ngOnInit(): void {
    this.listenToAction();
    this.form = this.fb.group(this.data.model.intirmDateFormBuilder())
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
  }
  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => (this.isCommentRequired() ? this.comment.invalid : false) || this.form.invalid))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(tap((_) => {
        this.data.model.licenseStartDate = !!this.form.value.licenseStartDate ? this.form.value.licenseStartDate : this.data.model.licenseStartDate
        this.data.model.licenseEndDate = !!this.form.value.licenseEndDate ? this.form.value.licenseEndDate : this.data.model.licenseEndDate
      }))
      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        licenseStartDate: this.licenseStartDate,
        licenseEndDate: this.licenseEndDate
      }
    });
  }
  isNewRequestType(): boolean {
    return this.data.model.requestType === EmploymentRequestType.NEW;
  }
  isCancelRequestType(): boolean {
    return this.data.model.requestType === EmploymentRequestType.CANCEL;
  }
  isInterm() {
    return this.data.model.employeeInfoDTOs[0].contractType == ContractTypes.Interim
  }
  isApproval() {
    return this.data.model.category == EmploymentCategory.APPROVAL
  }
  get licenseStartDate() {
    return this.form.controls.licenseStartDate as UntypedFormControl
  }
  get licenseEndDate() {
    return this.form.controls.licenseEndDate as UntypedFormControl;
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
