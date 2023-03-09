import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {WFResponseType} from '@enums/wfresponse-type.enum';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {CustomValidators} from '@app/validators/custom-validators';
import {UrgentInterventionClosure} from '@models/urgent-intervention-closure';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {InboxService} from '@services/inbox.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {LangService} from '@services/lang.service';
import {CommonUtils} from '@helpers/common-utils';
import {IWFResponse} from '@contracts/i-w-f-response';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {IKeyValue} from '@contracts/i-key-value';
import {DateUtils} from '@helpers/date-utils';
import {CustomTerm} from '@models/custom-term';
import {CustomTermPopupComponent} from '@app/shared/popups/custom-term-popup/custom-term-popup.component';
import {CustomTermService} from '@services/custom-term.service';
import {ServiceDataService} from '@services/service-data.service';
import {ServiceData} from '@models/service-data';

@Component({
  selector: 'urgent-intervention-closure-approve-task-popup',
  templateUrl: './urgent-intervention-closure-approve-task-popup.component.html',
  styleUrls: ['./urgent-intervention-closure-approve-task-popup.component.scss']
})
export class UrgentInterventionClosureApproveTaskPopupComponent implements OnInit, OnDestroy {

  private destroy$: Subject<any> = new Subject();

  constructor(private dialog: DialogService,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private inboxService: InboxService,
              public lang: LangService,
              private customTermService: CustomTermService,
              private serviceDataService: ServiceDataService,
              private fb: UntypedFormBuilder,
              @Inject(DIALOG_DATA_TOKEN) public data: {
                model: UrgentInterventionClosure,
                action: WFResponseType
              }) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this._setDefaultValues();
    this.listenToTakeAction();
    this.setRequiredComment();
  }

  label: keyof ILanguageKeys;
  action$: Subject<any> = new Subject<any>();
  response: WFResponseType = WFResponseType.APPROVE;
  model: UrgentInterventionClosure;
  form!: UntypedFormGroup;
  comment: UntypedFormControl = new UntypedFormControl('', [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
  customTerms: CustomTerm[] = [];

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  buildForm() {
    let controls: any = {
      followUpDate: ['', [CustomValidators.required, CustomValidators.minDate(new Date())]],
      publicTerms: [{value: '', disabled: true}, [CustomValidators.required]],
      customTerms: ['', [CustomValidators.required]],
      conditionalLicenseIndicator: [false],
    };

    this.form = this.fb.group(controls);

  }

  private _setDefaultValues() {
    of(this.model.getCaseType())
      .pipe(switchMap(caseType => this.serviceDataService.loadByCaseType(caseType)))
      .subscribe((service) => {
        this.updateForm(service);
      });
  }

  updateForm(serviceData: ServiceData) {
    let data: any = {
      followUpDate: DateUtils.changeDateToDatepicker(this.model.followUpDate),
      publicTerms: serviceData.serviceTerms,
      customTerms: this.model.customTerms,
      conditionalLicenseIndicator: this.model.conditionalLicenseIndicator
    };

    this.form.patchValue(data);
  }

  private displayInvalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : {selectedResponse: this.response};
  }

  private _updateCase() {
    let formValue = {...this.form.value};
    if (formValue.followUpDate) {
      formValue.followUpDate = DateUtils.changeDateFromDatepicker(formValue.followUpDate);
    }
    let valueToSave = this.model.clone(formValue);
    return valueToSave.save();
  }

  private listenToTakeAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(map(_ => this.form.valid && this.comment.valid))
      .pipe(tap(valid => !valid && this.displayInvalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(exhaustMap((_) => this._updateCase()))
      .pipe(switchMap((_) => this.inboxService.takeActionOnTask(this.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      });
  }

  isCancelRequestType(): boolean {
    return false; // this.data.model.requestType === ServiceRequestTypes.CANCEL;
  }

  private isCommentRequired(): boolean {
    return this.isCancelRequestType();
  }

  private loadUserCustomTerms(): Observable<CustomTerm[]> {
    return this.customTermService.loadByCaseType(this.model.getCaseType())
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(customTerms => this.customTerms = customTerms));
  }

  openAddCustomTermDialog() {
    const customTerm = new CustomTerm().clone({caseType: this.model.getCaseType()});
    this.dialog.show(CustomTermPopupComponent, {
      model: customTerm
    }).onAfterClose$
      .pipe(switchMap(_ => this.loadUserCustomTerms()))
      .subscribe();
  }

  onCustomTermsChange(customTerm: CustomTerm) {
    let appendTerm = this.customTermsField.value ? this.customTermsField.value + ' ' + customTerm.terms : customTerm.terms;
    this.customTermsField.setValue(appendTerm);
  }

  private setRequiredComment(): void {
    if (this.isCommentRequired()) {
      this.comment.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
      this.comment.updateValueAndValidity();
    }
  }

  get conditionalLicenseField(): UntypedFormControl {
    return this.form.get('conditionalLicenseIndicator') as UntypedFormControl;
  }

  get customTermsField(): UntypedFormControl {
    return this.form.get('customTerms') as UntypedFormControl;
  }

}
