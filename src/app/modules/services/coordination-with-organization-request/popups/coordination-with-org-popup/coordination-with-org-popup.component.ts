import {CoordinationWithOrganizationsRequestService} from '@services/coordination-with-organizations-request.service';
import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {InboxService} from '@services/inbox.service';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {CoordinationWithOrganizationsRequest} from '@models/coordination-with-organizations-request';
import {ParticipantOrg} from '@models/participant-org';
import {EmployeeService} from '@services/employee.service';
import {WFResponseType} from '@enums/wfresponse-type.enum';

@Component({
  selector: 'coordination-with-org-popup',
  templateUrl: './coordination-with-org-popup.component.html',
  styleUrls: ['./coordination-with-org-popup.component.scss']
})
export class CoordinationWithOrgPopupComponent implements OnInit {

  comment: UntypedFormControl = new UntypedFormControl('',
    [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  response: WFResponseType = WFResponseType.ORGANIZATION_APPROVE;
  action$: Subject<any> = new Subject<any>();
  currentOrganization!: ParticipantOrg;
  approvalForm!: UntypedFormGroup;

  private destroy$: Subject<void> = new Subject();

  constructor(
    @Inject(DIALOG_DATA_TOKEN) public data: {
      service: CoordinationWithOrganizationsRequestService,
      model: CoordinationWithOrganizationsRequest,
      actionType: WFResponseType,

    },
    public lang: LangService,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    private employeeService: EmployeeService,
    private fb: UntypedFormBuilder
  ) {
    this.currentOrganization = this.data.model.participatingOrganizaionList
      .find(x => x.organizationId === employeeService.getProfile()?.id)!;
    this.approvalForm = this.fb.group(this.currentOrganization.buildApprovalForm(true));
    this.response = this.data.actionType;


  }

  ngOnInit() {
    this._listenToAction();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  isEditAllowed() {
    return true;
  }

  private _listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.comment.invalid || this.approvalForm.invalid))
      .pipe(tap(invalid => {
        invalid && this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
        this.approvalForm.markAllAsTouched();
      }))
      .pipe(filter(invalid => !invalid))
      .pipe(tap(_ => {
        this.data.model= this.data.service.prepareModelBeforeSave(this.data.model)
        this.currentOrganization.organizationOfficerName = this.approvalForm.value.organizationOfficerName;
        this.currentOrganization.value = this.approvalForm.value.value;
      }))
      .pipe(exhaustMap(_ => this.data.model.save()))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(),
        this.data.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }
}
