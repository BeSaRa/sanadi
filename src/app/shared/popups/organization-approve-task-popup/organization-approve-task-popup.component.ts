import {Component, Inject, OnInit} from '@angular/core';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {CaseTypes} from '@app/enums/case-types.enum';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {CustomTerm} from '@app/models/custom-term';
import {DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {InboxService} from '@services/inbox.service';
import {QueryResult} from '@app/models/query-result';
import {CaseModel} from '@app/models/case-model';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {ServiceDataService} from '@services/service-data.service';
import {CustomTermService} from '@services/custom-term.service';
import {DialogService} from '@services/dialog.service';
import {CommonUtils} from '@helpers/common-utils';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {ServiceData} from '@app/models/service-data';
import {IWFResponse} from '@contracts/i-w-f-response';
import {CustomTermPopupComponent} from '@app/shared/popups/custom-term-popup/custom-term-popup.component';
import {UrgentJointReliefCampaign} from '@app/models/urgent-joint-relief-campaign';

@Component({
  selector: 'organization-approve-task-popup',
  templateUrl: './organization-approve-task-popup.component.html',
  styleUrls: ['./organization-approve-task-popup.component.scss']
})
export class OrganizationApproveTaskPopupComponent implements OnInit {
  comment: FormControl = new FormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  done$: Subject<any> = new Subject<any>();
  displayLicenseForm: boolean = false;
  licenseFormReadonly: boolean = false;
  destroy$: Subject<any> = new Subject<any>();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  customValidators = CustomValidators;

  private specialApproveServices: number[] = [
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.URGENT_INTERVENTION_LICENSING,
    CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN
  ]
  form!: FormGroup;

  private readonly action: WFResponseType;
  private loadedLicense?: LicenseApprovalModel<any, any>;
  customTerms: CustomTerm[] = [];

  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      service: EServiceGenericService<any>,
      inboxService: InboxService,
      actionType: WFResponseType,
      taskId: string,
      task: QueryResult | CaseModel<any, any>,
      claimBefore: boolean
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private serviceDataService: ServiceDataService,
    private customTermService: CustomTermService,
    private dialog: DialogService) {

    this.action = WFResponseType.ORGANIZATION_APPROVE;
  }

  ngOnInit(): void {
    console.log('onInit');
    this.listenToTakeAction();
    of(this.data.task.getCaseType())
      .pipe(filter(caseType => this.specialApproveServices.includes(caseType)))
      .pipe(tap(xx => {
        console.log('xx', xx);
      }))
      .pipe(switchMap(_ => this.data.task.loadLicenseModel()))
      .pipe(tap(yy => {
        console.log('yy', yy);
      }))
      .pipe(switchMap(license => this.serviceDataService.loadByCaseType(this.data.task.getCaseType()).pipe(map(service => ({
        service,
        license
      })))))
      .pipe(tap(zz => {
        console.log('zz', zz);
      }))
      .subscribe(({license, service}) => {
        console.log('subscribe called');
        this.loadedLicense = license;
        this.displayCustomForm(license);
        this.buildForm();
        if (this.employeeService.isRiskAndComplianceUser()) {
          this.displayLicenseForm = false;
          /*this.licenseFormReadonly = true;
          this.form.disable();*/
        }
        // if (this.displayLicenseForm) {
        //   this.updateForm(license, service);
        // }
      })
    this.setRequiredComment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  displayCustomForm(caseDetails: LicenseApprovalModel<any, any>): void {
    this.displayLicenseForm = this.data.task &&
      this.specialApproveServices.includes(this.data.task.getCaseType()) &&
      caseDetails.requestType !== ServiceRequestTypes.CANCEL &&
      (
        this.action === WFResponseType.FINAL_APPROVE ||
        (this.action === WFResponseType.APPROVE && !this.employeeService.isSupervisionAndControlUser() && !this.employeeService.isDevelopmentalExpert() && !this.employeeService.isConstructionExpert())
      );
  }

  buildForm() {
    this.form = this.fb.group({
      basicInfo: this.fb.group((this.data.task as UrgentJointReliefCampaign).buildBasicInfo(true)),
      explanation: this.fb.group((this.data.task as UrgentJointReliefCampaign).buildExplanation(true)),
      externalUserData: this.fb.group((this.data.task as UrgentJointReliefCampaign).buildExternalUserData(true)),
    });
  }

  updateForm(caseDetails: LicenseApprovalModel<any, any>, serviceData: ServiceData) {
    let data: any = {
      licenseStartDate: DateUtils.changeDateToDatepicker(caseDetails.licenseStartDate),
      licenseDuration: caseDetails.licenseDuration,
      publicTerms: serviceData.serviceTerms,
      customTerms: caseDetails.customTerms,
      conditionalLicenseIndicator: caseDetails.conditionalLicenseIndicator,
      followUpDate: DateUtils.changeDateToDatepicker(caseDetails.followUpDate),
      deductionPercent: caseDetails.deductionPercent
    };

    if (!this.canShowDeductionRatio) {
      delete data.deductionPercent
    }

    this.form.patchValue(data);

    let licenseDurationValidations = [CustomValidators.required, CustomValidators.number];
    if (CommonUtils.isValidValue(serviceData.licenseMinTime)) {
      licenseDurationValidations.push(Validators.min(serviceData.licenseMinTime));
    }
    if (CommonUtils.isValidValue(serviceData.licenseMaxTime)) {
      licenseDurationValidations.push(Validators.max(serviceData.licenseMaxTime));
    }
    this.licenseDurationField.setValidators(licenseDurationValidations);
    this.licenseDurationField.updateValueAndValidity();
  }

  proceed(): Observable<boolean> {
    let responseInfo: Partial<IWFResponse> = {
      selectedResponse: this.action,
      comment: this.comment.value ? this.comment.value : undefined
    }, stream$ = of(null);

    return stream$.pipe(
      switchMap(() => this.updateCase()),
      switchMap(() => this.data.inboxService.takeActionOnTask(this.data.taskId, responseInfo, this.data.service))
    )
  }

  private listenToTakeAction() {
    this.done$
      .pipe(
        // beforeSave
        switchMap(_ => {
          let validData = true;
          if (this.displayLicenseForm) {
            validData = this.licenseFormReadonly ? true : this.form.valid;
            if (!validData) {
              this.form.markAllAsTouched();
            }
          }

          if (validData && this.isCommentRequired()) {
            validData = !!this.comment.value;
          }
          return isObservable(validData) ? validData : of(validData);
        }),
        // emit only if the beforeSave returned true
        filter(value => !!value),
        switchMap(_ => this.data.claimBefore ? this.data.task.claim() : of(null)),
        switchMap(() => this.proceed())
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  get conditionalLicenseField(): FormControl {
    return this.form.get('conditionalLicenseIndicator') as FormControl;
  }

  get licenseDurationField(): FormControl {
    return this.form.get('licenseDuration') as FormControl;
  }

  get licenseStartDateField(): FormControl {
    return this.form.get('licenseStartDate') as FormControl;
  }

  get customTermsField(): FormControl {
    return this.form.get('customTerms') as FormControl;
  }

  updateCase(): Observable<any> {
    return this.loadedLicense ? this.loadedLicense.patchAndUpdateModel({
      ...this.data.task,
      id: this.loadedLicense.id
    }) : of(null);
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

  private loadUserCustomTerms(): Observable<CustomTerm[]> {
    return this.customTermService.loadByCaseType(this.data.task.getCaseType())
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(customTerms => this.customTerms = customTerms));
  }

  openAddCustomTermDialog() {
    const customTerm = new CustomTerm().clone({caseType: this.data.task.getCaseType()});
    this.dialog.show(CustomTermPopupComponent, {
      model: customTerm
    }).onAfterClose$
      .pipe(switchMap(_ => this.loadUserCustomTerms()))
      .subscribe();
  }

  onCustomTermsChange(customTerm: CustomTerm) {
    let appendTerm = this.customTermsField.value ? this.customTermsField.value + ' ' + customTerm.terms : customTerm.terms;
    this.customTermsField.setValue(appendTerm)
  }

  get canShowDeductionRatio(): boolean {
    return this.data.task.getCaseType() === CaseTypes.INTERNAL_PROJECT_LICENSE;
  }
}
