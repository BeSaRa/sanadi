import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
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
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
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
import {CustomTerm} from "@app/models/custom-term";
import {CustomTermService} from "@app/services/custom-term.service";
import {DialogService} from "@app/services/dialog.service";
import {CustomTermPopupComponent} from "@app/shared/popups/custom-term-popup/custom-term-popup.component";
import {CaseModel} from "@app/models/case-model";
import {DatepickerOptionsMap} from '@app/types/types';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'action-with-comment-popup',
  templateUrl: './action-with-comment-popup.component.html',
  styleUrls: ['./action-with-comment-popup.component.scss']
})
export class ActionWithCommentPopupComponent implements OnInit, OnDestroy {
  label: keyof ILanguageKeys;
  comment: FormControl = new FormControl();
  done$: Subject<any> = new Subject<any>();
  displayLicenseForm: boolean = false;
  licenseFormReadonly: boolean = false;
  destroy$: Subject<any> = new Subject<any>();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  private specialApproveServices: number[] = [
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.INTERNAL_PROJECT_LICENSE
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

    if (this.data.actionType.indexOf(WFResponseType.ASK_FOR_CONSULTATION) === 0) {
      this.label = 'ask_for_consultation_task';
    } else {
      this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.actionType) + '_task') as unknown as keyof ILanguageKeys);
    }
    this.action = this.data.actionType;
  }

  ngOnInit(): void {
    this.listenToTakeAction();
    of(this.data.task.getCaseType())
      .pipe(filter(caseType => this.specialApproveServices.includes(caseType)))
      .pipe(switchMap(_ => this.data.task.loadLicenseModel()))
      .pipe(switchMap(license => this.serviceDataService.loadByCaseType(this.data.task.getCaseType()).pipe(map(service => ({
        service,
        license
      })))))
      .subscribe(({license, service}) => {
        this.loadedLicense = license;
        this.displayCustomForm(license);
        this.buildForm();
        if (this.employeeService.isRiskAndComplianceUser()) {
          this.displayLicenseForm = false;
          /*this.licenseFormReadonly = true;
          this.form.disable();*/
        }
        if (this.displayLicenseForm) {
          this.updateForm(license, service);
        }
      })
    this.setRequiredComment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  displayCustomForm(caseDetails: LicenseApprovalModel<any, any>): void {
    /*this.displayLicenseForm = this.data.task &&
      ((this.action === WFResponseType.APPROVE && !this.employeeService.isSupervisionAndControlUser()) || this.action === WFResponseType.FINAL_APPROVE) &&
      this.specialApproveServices.includes(this.data.task.BD_CASE_TYPE) &&
      caseDetails.requestType !== ServiceRequestTypes.CANCEL;*/

    this.displayLicenseForm = this.data.task &&
      this.specialApproveServices.includes(this.data.task.getCaseType()) &&
      caseDetails.requestType !== ServiceRequestTypes.CANCEL &&
      (
        this.action === WFResponseType.FINAL_APPROVE ||
        (this.action === WFResponseType.APPROVE && !this.employeeService.isSupervisionAndControlUser() && !this.employeeService.isDevelopmentalExpert() && !this.employeeService.isConstructionExpert())
      );
  }

  buildForm() {
    let controls: any = {
      licenseStartDate: [{value: '', disabled: this.loadedLicense?.requestType === ServiceRequestTypes.UPDATE}],
      licenseDuration: [{value: null, disabled: this.loadedLicense?.requestType === ServiceRequestTypes.UPDATE},
        [CustomValidators.required, CustomValidators.number]],
      publicTerms: [{value: '', disabled: true}, [CustomValidators.required]],
      customTerms: ['', [CustomValidators.required]],
      conditionalLicenseIndicator: [false],
      followUpDate: ['', [CustomValidators.required, CustomValidators.minDate(new Date())]],
      deductionPercent: ['', [CustomValidators.required, CustomValidators.decimal(2), Validators.max(100)]]
    };

    if (!this.canShowDeductionRatio) {
      delete controls.deductionPercent;
    }
    this.form = this.fb.group(controls);
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

    if (this.action === WFResponseType.COMPLETE) {
      responseInfo = {
        comment: this.comment.value ? this.comment.value : undefined
      };
      this.data.task.getResponses().includes(WFResponseType.COMPLETE) && (responseInfo['selectedResponse'] = WFResponseType.COMPLETE)
    }

    return stream$.pipe(
      switchMap(_ => this.displayLicenseForm ? this.updateCase() : of(null)),
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
      ...this.form.value,
      id: this.loadedLicense.id
    }, (data) => {

      let licenseStartDate = data.licenseStartDate;
      if (!licenseStartDate && this.action === WFResponseType.FINAL_APPROVE && this.loadedLicense?.requestType !== ServiceRequestTypes.UPDATE && this.loadedLicense?.requestType !== ServiceRequestTypes.CANCEL) {
        if (this.loadedLicense?.licenseApprovedDate) {
          licenseStartDate = this.loadedLicense?.licenseApprovedDate;
        } else {
          licenseStartDate = new Date().toString();
        }
      }
      data.licenseStartDate = DateUtils.changeDateFromDatepicker(licenseStartDate);
      if (data.licenseEndDate) {
        data.licenseEndDate = DateUtils.changeDateFromDatepicker(data.licenseEndDate);
      }
      if (data.followUpDate) {
        data.followUpDate = DateUtils.changeDateFromDatepicker(data.followUpDate);
      }
      let fields = Object.keys(this.form.value).concat(['id']);
      return Object.keys(data).filter(field => fields.includes(field)).reduce((acc, field) => {
        return {...acc, [field]: data[field], ignoreSendInterceptor: true};
      }, {});
    }) : of(null);
  }

  private setRequiredComment(): void {
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required]);
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
