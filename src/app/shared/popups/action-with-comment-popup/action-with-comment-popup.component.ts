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
import {Observable, of, Subject} from 'rxjs';
import {filter, switchMap, withLatestFrom} from 'rxjs/operators';
import {CaseTypes} from "@app/enums/case-types.enum";
import {CustomValidators} from '@app/validators/custom-validators';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {CaseModel} from '@app/models/case-model';
import {ServiceDataService} from '@app/services/service-data.service';
import {ServiceData} from '@app/models/service-data';
import {CommonUtils} from '@app/helpers/common-utils';

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
  private specialApproveServices: number[] = [
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    // CaseTypes.PARTNER_APPROVAL
  ]
  form!: FormGroup;

  private readonly action: WFResponseType;
  private loadedLicense?: LicenseApprovalModel<any, any>;

  datepickerOptionsMap: IKeyValue = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
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
    this.displayCustomForm();
    this.buildForm();
    if (this.displayLicenseForm) {
      this.data.task.loadLicenseModel()
        .pipe(
          withLatestFrom(this.serviceDataService.loadByCaseType(this.data.task.BD_CASE_TYPE))
        )
        .subscribe(([caseDetails, serviceData]) => {
          console.log(caseDetails, serviceData);
          this.loadedLicense = caseDetails;
          this.updateForm(caseDetails, serviceData);
        });
    }
  }

  displayCustomForm(): void {
    this.displayLicenseForm = this.data.task && (this.action === WFResponseType.APPROVE || this.action === WFResponseType.FINAL_APPROVE) && this.specialApproveServices.includes(this.data.task.BD_CASE_TYPE);
  }

  buildForm() {
    this.form = this.fb.group({
      licenseStartDate: ['', [CustomValidators.required]],
      licenseDuration: [null, [CustomValidators.required, CustomValidators.number]],
      publicTerms: [{
        value: '',
        disabled: true
      }, [CustomValidators.required]],
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
}
