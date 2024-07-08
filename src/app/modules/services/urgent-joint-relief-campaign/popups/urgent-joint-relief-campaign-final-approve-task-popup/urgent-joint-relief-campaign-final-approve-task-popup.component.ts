import { Component, Inject, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { WFResponseType } from '@enums/wfresponse-type.enum';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IKeyValue } from '@contracts/i-key-value';
import { DateUtils } from '@helpers/date-utils';
import { DialogService } from '@services/dialog.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ToastService } from '@services/toast.service';
import { InboxService } from '@services/inbox.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { LangService } from '@services/lang.service';
import { CommonUtils } from '@helpers/common-utils';
import { exhaustMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IWFResponse } from '@contracts/i-w-f-response';
import { UrgentJointReliefCampaign } from '@models/urgent-joint-relief-campaign';
import { CustomTerm } from '@models/custom-term';
import { CustomTermPopupComponent } from '@app/shared/popups/custom-term-popup/custom-term-popup.component';
import { CustomTermService } from '@services/custom-term.service';
import { ServiceDataService } from '@services/service-data.service';

@Component({
  selector: 'urgent-joint-relief-campaign-final-approve-task-popup',
  templateUrl: './urgent-joint-relief-campaign-final-approve-task-popup.component.html',
  styleUrls: ['./urgent-joint-relief-campaign-final-approve-task-popup.component.scss']
})
export class UrgentJointReliefCampaignFinalApproveTaskPopupComponent implements OnInit {
  form!: UntypedFormGroup;
  private destroy$: Subject<void> = new Subject();
  label: keyof ILanguageKeys;
  customTerms: CustomTerm[] = [];
  selectedLicense!: UrgentJointReliefCampaign | null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.FINAL_APPROVE;

  model: UrgentJointReliefCampaign;
  comment: UntypedFormControl = new UntypedFormControl();
  followUpDate: UntypedFormControl = new UntypedFormControl();
  minLicenseMonths!: number;
  maxLicenseMonths!: number;
  servicePublicTerms: string = '';

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(
    private customTermService: CustomTermService,
    private serviceDataService: ServiceDataService,
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: UrgentJointReliefCampaign,
      action: WFResponseType
    },
    public lang: LangService,
  ) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  get conditionalLicenseField(): AbstractControl {
    return this.form.get('conditionalLicenseIndicator')!
  }

  get customTermsField(): AbstractControl {
    return this.form.get('customTerms')!
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this.selectedLicense = this.model;
    this.conditionalLicenseField.patchValue(this.model.conditionalLicenseIndicator);
    this.customTermsField.patchValue(this.model.customTerms);
    this.listenToAction();
    this.loadTerms();
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildFinalApprovalForm(true));

  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        this.model.customTerms = this.customTermsField.value;
        this.model.conditionalLicenseIndicator = this.conditionalLicenseField.value;
        return this.data.model.save();
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
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
      selectedResponse: this.response
    } : {selectedResponse: this.response};
  }

  private loadUserCustomTerms(): Observable<CustomTerm[]> {
    return this.customTermService.loadByCaseType(this.model.getCaseType())
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(customTerms => this.customTerms = customTerms));
  }

  private loadTerms() {
    this.serviceDataService
      .loadByCaseType(this.model.caseType)
      .pipe(tap(service => {
        this.minLicenseMonths = service.licenseMinTime;
        this.maxLicenseMonths = service.licenseMaxTime;
      }))
      .pipe(tap(service => {
        this.servicePublicTerms = service.serviceTerms
      }))
      .pipe(switchMap(_ => {
        return this.loadUserCustomTerms()
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe()
  }

  openAddCustomTermDialog() {
    const customTerm = new CustomTerm().clone({ caseType: this.model.getCaseType() });
    this.dialog.show(CustomTermPopupComponent, {
      model: customTerm
    }).onAfterClose$
      .pipe(switchMap(_ => this.loadUserCustomTerms()))
      .subscribe();
  }

  onCustomTermsChange(customTerm: CustomTerm) {
    let appendTerm = this.customTermsField.value ? this.customTermsField.value + '\n' + customTerm.terms : customTerm.terms;
    this.customTermsField.setValue(appendTerm)
  }
}
