import { Subject } from 'rxjs';
import { EmploymentRequestType } from './../../../../enums/employment-request-type';
import { exhaustMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from './../../../../services/toast.service';
import { DialogRef } from './../../../../shared/models/dialog-ref';
import { WFResponseType } from './../../../../enums/wfresponse-type.enum';
import { IWFResponse } from './../../../../interfaces/i-w-f-response';
import { CustomValidators } from './../../../../validators/custom-validators';
import { FormControl } from '@angular/forms';
import { InboxService } from './../../../../services/inbox.service';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './../../../../services/dialog.service';
import { LangService } from './../../../../services/lang.service';
import { ContractTypes } from './../../../../enums/contract-types.enum';
import { IGridAction } from './../../../../interfaces/i-grid-action';
import { Employee } from './../../../../models/employee';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Employment } from "@app/models/employment";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { EmploymentCategory } from '@app/enums/employment-category.enum';
import { ApproveEmploymentDateComponent } from '../approve-employment-date/approve-employment-date.component';

@Component({
  selector: 'employment-approve',
  templateUrl: './employment-approve.component.html',
  styleUrls: ['./employment-approve.component.scss']
})
export class EmploymentApproveComponent implements OnInit, OnDestroy {
  employees: Partial<Employee>[] = [];
  comment: FormControl = new FormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.APPROVE;
  action$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject();
  actions: IGridAction[] = this.internaAndApproval() ? [
    {
      icon: 'calendar',
      langKey: 'btn_delete',
      callback: (e: any, data: any) => {
        return this.dialog.show(ApproveEmploymentDateComponent, {
          model: data,
          service: this.data.model.service
        });
      },
    }
  ] : []
  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: Employment,
      action: WFResponseType
    },
    private inboxService: InboxService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService, private dialog: DialogService) {
    this.response = this.data.action;
    this.employees = data.model.employeeInfoDTOs;
  }

  ngOnInit(): void {
    this.listenToAction();
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
    }
    this.data.model.service.onSetExpirDate.subscribe((data) => {
      this.data.model.employeeInfoDTOs[0].contractExpiryDate = data
    })
  }
  internaAndApproval() {
    return this.data.model.category == EmploymentCategory.APPROVAL && this.data.model.employeeInfoDTOs[0].contractType == ContractTypes.Interim
  }
  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.isCommentRequired() ? this.comment.invalid : false))
      .pipe(tap(invalid => invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled)))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }

  isCancelRequestType(): boolean {
    return this.data.model.requestType === EmploymentRequestType.CANCEL;
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
