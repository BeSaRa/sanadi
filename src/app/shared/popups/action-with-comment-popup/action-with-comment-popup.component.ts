import {Component, Inject, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {InboxService} from '@app/services/inbox.service';
import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DialogRef} from '../../models/dialog-ref';
import {ToastService} from '@app/services/toast.service';
import {IWFResponse} from '@app/interfaces/i-w-f-response';
import {QueryResult} from '@app/models/query-result';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {filter, switchMap, withLatestFrom} from 'rxjs/operators';
import {CaseTypes} from "@app/enums/case-types.enum";
import {CustomValidators} from '@app/validators/custom-validators';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {CommonUtils} from '@app/helpers/common-utils';
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {EmployeeService} from '@app/services/employee.service';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'action-with-comment-popup',
  templateUrl: './action-with-comment-popup.component.html',
  styleUrls: ['./action-with-comment-popup.component.scss']
})
export class ActionWithCommentPopupComponent implements OnInit {
  label: keyof ILanguageKeys;
  comment: FormControl = new FormControl();
  done$: Subject<any> = new Subject<any>();
  displayLicenseForm: boolean = false;
  licenseFormReadonly: boolean = false;
  private specialApproveServices: number[] = [
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL
  ]
  form!: FormGroup;

  private readonly action: WFResponseType;
  private loadedLicense?: LicenseApprovalModel<any, any>;

  datepickerOptionsMap: IKeyValue = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(
    @Inject(DIALOG_DATA_TOKEN) private data: {
      service: EServiceGenericService<any>,
      inboxService: InboxService,
      actionType: WFResponseType,
      taskId: string,
      task: QueryResult,
      claimBefore: boolean
    },
    private dialogRef: DialogRef,
    private toast: ToastService,
    public lang: LangService,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private serviceDataService: ServiceDataService) {

    if (this.data.actionType.indexOf(WFResponseType.ASK_FOR_CONSULTATION) === 0) {
      this.label = 'ask_for_consultation_task';
    } else {
      this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.actionType) + '_task') as unknown as keyof ILanguageKeys);
    }
    this.action = this.data.actionType;
  }


  ngOnInit(): void {
    this.listenToTakeAction();
    if (this.data.task) {
      this.data.task.loadLicenseModel()
        .pipe(
          withLatestFrom(this.serviceDataService.loadByCaseType(this.data.task.BD_CASE_TYPE))
        )
        .subscribe(([caseDetails, serviceData]) => {
          this.loadedLicense = caseDetails;
          this.displayCustomForm(caseDetails);
          this.buildForm();
          if (this.displayLicenseForm) {
            this.updateForm(caseDetails, serviceData);
          }
          if (this.employeeService.isRiskAndComplianceUser()) {
            this.licenseFormReadonly = true;
            this.form.disable();
          }
        });
    }

    this.setRequiredCommentIfRejectOrPostpone();
  }

  displayCustomForm(caseDetails: LicenseApprovalModel<any, any>): void {
    this.displayLicenseForm = this.data.task &&
      (this.action === WFResponseType.APPROVE || this.action === WFResponseType.FINAL_APPROVE) &&
      this.specialApproveServices.includes(this.data.task.BD_CASE_TYPE) &&
      caseDetails.requestType !== ServiceRequestTypes.CANCEL;
  }

  buildForm() {
    this.form = this.fb.group({
      licenseStartDate: [{value: '', disabled: this.loadedLicense?.requestType === ServiceRequestTypes.UPDATE}],
      licenseDuration: [{value: null, disabled: this.loadedLicense?.requestType === ServiceRequestTypes.UPDATE},
        [CustomValidators.required, CustomValidators.number]],
      publicTerms: [{value: '', disabled: true}, [CustomValidators.required]],
      customTerms: ['', [CustomValidators.required]],
      conditionalLicenseIndicator: [false],
      followUpDate: ['', [CustomValidators.required]]
    });
  }

  updateForm(caseDetails: LicenseApprovalModel<any, any>, serviceData: ServiceData) {
    this.form.patchValue({
      licenseStartDate: DateUtils.changeDateToDatepicker(caseDetails.licenseStartDate),
      licenseDuration: caseDetails.licenseDuration,
      publicTerms: serviceData.serviceTerms,
      customTerms: caseDetails.customTerms,
      conditionalLicenseIndicator: caseDetails.conditionalLicenseIndicator,
      followUpDate: DateUtils.changeDateToDatepicker(caseDetails.followUpDate)
    });
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

    if (this.action === WFResponseType.COMPLETE) {
      responseInfo = {
        comment: this.comment.value ? this.comment.value : undefined
      };
      this.data.task.RESPONSES.includes(WFResponseType.COMPLETE) && (responseInfo['selectedResponse'] = WFResponseType.COMPLETE)
    }

    return stream$.pipe(
      switchMap(_ => this.updateCase()),
      // filter(_ => false),
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
          } else if (this.action === WFResponseType.REJECT || this.action === WFResponseType.POSTPONE) {
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

  updateCase(): Observable<any> {
    return this.loadedLicense ? this.loadedLicense.patchAndUpdateModel({
      ...this.form.value,
      id: this.loadedLicense.id
    }, (data) => {
      if (data.licenseStartDate) {
        data.licenseStartDate = DateUtils.changeDateFromDatepicker(data.licenseStartDate);
      }
      if (data.licenseEndDate) {
        data.licenseEndDate = DateUtils.changeDateFromDatepicker(data.licenseEndDate);
      }
      if (data.followUpDate) {
        data.followUpDate = DateUtils.changeDateFromDatepicker(data.followUpDate);
      }

      return data;
    }) : of(null);
  }

  private setRequiredCommentIfRejectOrPostpone(): void {
    if (this.action === WFResponseType.REJECT || this.action === WFResponseType.POSTPONE) {
      this.comment.setValidators([CustomValidators.required]);
      this.comment.updateValueAndValidity();
    }
  }
}
