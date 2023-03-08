import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {InboxService} from '@services/inbox.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {ServiceDataService} from '@services/service-data.service';
import {DialogService} from '@services/dialog.service';
import {filter, switchMap} from 'rxjs/operators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {UrgentJointReliefCampaign} from '@models/urgent-joint-relief-campaign';
import {UrgentJointReliefCampaignService} from '@services/urgent-joint-relief-campaign.service';
import {OrganizationOfficer} from '@models/organization-officer';

@Component({
  selector: 'urgent-joint-relief-campaign-organization-approve-task-popup',
  templateUrl: './urgent-joint-relief-campaign-organization-approve-task-popup.component.html',
  styleUrls: ['./urgent-joint-relief-campaign-organization-approve-task-popup.component.scss']
})
export class UrgentJointReliefCampaignOrganizationApproveTaskPopupComponent implements OnInit {
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  done$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  customValidators = CustomValidators;

  private readonly action: WFResponseType;
  model?: UrgentJointReliefCampaign;
  form!: UntypedFormGroup;
  selectedOrganizationOfficers: OrganizationOfficer[] = [];

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      service: UrgentJointReliefCampaignService,
      inboxService: InboxService,
      taskId: string,
      actionType: WFResponseType,
      claimBefore: boolean,
      model: UrgentJointReliefCampaign,
      externalUserData: {form: UntypedFormGroup, organizationOfficers: OrganizationOfficer[]}
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private employeeService: EmployeeService,
    private serviceDataService: ServiceDataService,
    private dialog: DialogService) {
    this.model = data.model;
    this.form = data.externalUserData.form;
    this.selectedOrganizationOfficers = data.externalUserData.organizationOfficers;
    this.action = WFResponseType.ORGANIZATION_APPROVE;
  }

  ngOnInit(): void {
    this.listenToTakeAction();
    this.setRequiredComment();
    this.prepareModel();
  }

  get externalUserData(): UntypedFormGroup {
    return this.form.get('externalUserData')! as UntypedFormGroup;
  }

  prepareModel() {
    this.model = new UrgentJointReliefCampaign().clone({
      ...this.model,
      ...this.externalUserData.getRawValue()
    });
    this.model.organizaionOfficerList = this.selectedOrganizationOfficers;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  proceed(): Observable<boolean> {
    let responseInfo: Partial<IWFResponse> = {
      selectedResponse: this.action,
      comment: this.comment.value ? this.comment.value : undefined
    }, stream$ = of(null);

    return stream$.pipe(
      switchMap(() => this.updateCase()),
      switchMap(() => this.data.inboxService.takeActionOnTask(this.data.taskId, responseInfo, this.data.service))
    );
  }

  private listenToTakeAction() {
    this.done$
      .pipe(
        // beforeSave
        switchMap(_ => {
          let stream$ = of(null);
          let validExternalData = true;
          let validOrgOfficerList = true;
          return stream$.pipe(
            switchMap(() => {
              if (!this.model?.donation || !this.model?.workStartDate) {
                this.dialog.error(this.lang.map.enter_donation_and_start_work_date);
                validExternalData = false;
              }
              return of(validExternalData);
            }),
            filter(validExternalData => {
              return validExternalData
            }),
            switchMap(() => {
              if (this.model?.organizaionOfficerList?.length! < 1) {
                this.dialog.error(this.lang.map.add_organization_officers);
                validOrgOfficerList = false;
              }
              return of(validOrgOfficerList);
            })
          );
        }),
        switchMap(valid => {
          if (valid && this.isCommentRequired()) {
            valid = !!this.comment.value;
          }
          return isObservable(valid) ? valid : of(valid);
        }),
        // emit only if the beforeSave returned true
        filter(value => !!value),
        switchMap(_ => this.data.claimBefore ? this.data.model.claim() : of(null)),
        switchMap(() => this.proceed())
      ).subscribe(() => {
      this.toast.success(this.lang.map.process_has_been_done_successfully);
      this.dialogRef.close(true);
    });
  }

  updateCase(): Observable<any> {
    this.model!.participatingOrganizaionList.find(x => x.organizationId == this.employeeService.getProfile()!.id)!.workStartDate = this.model?.workStartDate;
    this.model!.participatingOrganizaionList.find(x => x.organizationId == this.employeeService.getProfile()!.id)!.donation = this.model?.donation;
    this.model = (new UrgentJointReliefCampaign()).clone(this.model);
    return this.model ? this.model.update() : of(null);
  }

  private setRequiredComment(): void {
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
      this.comment.updateValueAndValidity();
    }
  }

  private isCommentRequired(): boolean {
    return this.action === WFResponseType.REJECT || this.action === WFResponseType.POSTPONE || this.action === WFResponseType.COMPLETE || this.action === WFResponseType.RETURN;
  }
}
