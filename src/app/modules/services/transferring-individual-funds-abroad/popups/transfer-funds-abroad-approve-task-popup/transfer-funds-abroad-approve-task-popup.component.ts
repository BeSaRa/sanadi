import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CustomTerm} from '@models/custom-term';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {IKeyValue} from '@contracts/i-key-value';
import {DateUtils} from '@helpers/date-utils';
import {TransferringIndividualFundsAbroad} from '@models/transferring-individual-funds-abroad';
import {CustomTermService} from '@services/custom-term.service';
import {ServiceDataService} from '@services/service-data.service';
import {DialogService} from '@services/dialog.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ToastService} from '@services/toast.service';
import {InboxService} from '@services/inbox.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {CommonUtils} from '@helpers/common-utils';
import {exhaustMap, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IWFResponse} from '@contracts/i-w-f-response';
import {CustomTermPopupComponent} from '@app/shared/popups/custom-term-popup/custom-term-popup.component';

@Component({
  selector: 'transfer-funds-abroad-approve-task-popup',
  templateUrl: './transfer-funds-abroad-approve-task-popup.component.html',
  styleUrls: ['./transfer-funds-abroad-approve-task-popup.component.scss']
})
export class TransferFundsAbroadApproveTaskPopupComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  customTerms: CustomTerm[] = [];
  selectedLicense!: TransferringIndividualFundsAbroad | null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: TransferringIndividualFundsAbroad;
  minLicenseMonths!: number;
  maxLicenseMonths!: number;
  servicePublicTerms: string = '';

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past', appendToBody: true}),
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'past', appendToBody: true}),
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
      model: TransferringIndividualFundsAbroad,
      action: WFResponseType
    },
    public lang: LangService) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  get customTermsField(): AbstractControl {
    return this.form.get('customTerms')!
  }

  get followUpDateField(): UntypedFormControl {
    return this.form.get('followUpDate') as UntypedFormControl;
  }

  get licenseEndDateField(): UntypedFormControl {
    return this.form.get('licenseEndDate') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.buildForm();
    this.selectedLicense = this.model;
    this.customTermsField.patchValue(this.model.customTerms);
    this.followUpDateField.patchValue(DateUtils.changeDateToDatepicker(this.model.followUpDate));
    this.licenseEndDateField.patchValue(DateUtils.changeDateToDatepicker(this.model.licenseEndDate));
    this.listenToAction();
    this.loadTerms();
  }

  buildForm() {
    this.form = this.fb.group(this.model.buildApprovalForm(true));
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        this.model.customTerms = this.customTermsField.value;
        this.model.followUpDate = DateUtils.getDateStringFromDate(this.followUpDateField.value);
        this.model.licenseEndDate = DateUtils.getDateStringFromDate(this.licenseEndDateField.value);
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
    return {selectedResponse: this.response};
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
