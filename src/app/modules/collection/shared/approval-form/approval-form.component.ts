import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {EServiceGenericService} from "@app/generics/e-service-generic-service";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {LicenseApprovalInterface} from "@app/interfaces/license-approval-interface";
import {LangService} from "@app/services/lang.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {CustomTerm} from "@app/models/custom-term";
import {switchMap, takeUntil, tap} from "rxjs/operators";
import {CustomTermService} from "@app/services/custom-term.service";
import {CustomTermPopupComponent} from "@app/shared/popups/custom-term-popup/custom-term-popup.component";
import {DialogService} from "@app/services/dialog.service";
import {IKeyValue} from "@app/interfaces/i-key-value";
import {DateUtils} from "@app/helpers/date-utils";
import {CollectionApproval} from "@app/models/collection-approval";
import {ServiceDataService} from "@app/services/service-data.service";
import {CollectionItem} from "@app/models/collection-item";
import {LicenseDurationType} from "@app/enums/license-duration-type";
import {CustomValidators} from "@app/validators/custom-validators";

@Component({
  selector: 'approval-form',
  templateUrl: './approval-form.component.html',
  styleUrls: ['./approval-form.component.scss']
})
export class ApprovalFormComponent implements OnInit, OnDestroy {
  @Input()
  model!: CollectionApproval;
  @Input()
  service!: EServiceGenericService<any>
  destroy$: Subject<any> = new Subject();
  form!: FormGroup

  customTerms: CustomTerm[] = [];

  servicePublicTerms: string = '';
  @Output()
  formCancel: EventEmitter<null> = new EventEmitter<null>();

  _license$: BehaviorSubject<LicenseApprovalInterface | null> = new BehaviorSubject<LicenseApprovalInterface | null>(null)

  @Output()
  saveInfo: EventEmitter<LicenseApprovalInterface> = new EventEmitter<LicenseApprovalInterface>();

  @Input()
  set license(val: LicenseApprovalInterface | null) {
    this._license$.next(val);
  }

  get license(): LicenseApprovalInterface | null {
    return this._license$.value;
  }

  datepickerOptionsMap: IKeyValue = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    licenseEndDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(private fb: FormBuilder,
              private customTermService: CustomTermService,
              private dialog: DialogService,
              private serviceDataService: ServiceDataService,
              public lang: LangService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this.afterBuildForm();
    this.loadTerms();
    this.listenToLicenseChange();
  }

  private buildForm(): void {
    this.form = this.fb.group((new CollectionItem).buildApprovalForm(true));
  }

  // noinspection JSUnusedLocalSymbols
  private updateForm(model: LicenseApprovalInterface): void {
    this.form.patchValue(model.clone({publicTerms: model.publicTerms ? model.publicTerms : this.servicePublicTerms}).buildApprovalForm(false))
  }

  private loadUserCustomTerms(): Observable<CustomTerm[]> {
    return this.customTermService.loadByCaseType(this.model.getCaseType())
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(customTerms => this.customTerms = customTerms));
  }

  get customTermsField(): AbstractControl {
    return this.form.get('customTerms')!
  }

  get licenseStartDateField(): AbstractControl {
    return this.form.get('licenseStartDate')!;
  }

  get licenseEndDateField(): AbstractControl {
    return this.form.get('licenseEndDate')!;
  }

  get publicTerms(): AbstractControl {
    return this.form.get('publicTerms')!
  }

  get conditionalLicenseField(): AbstractControl {
    return this.form.get('conditionalLicenseIndicator')!
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
    let appendTerm = this.customTermsField.value ? this.customTermsField.value + '\n' + customTerm.terms : customTerm.terms;
    this.customTermsField.setValue(appendTerm)
  }

  updateRelativeDates() {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: 'licenseStartDate',
      toFieldName: 'licenseEndDate',
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        licenseStartDate: this.licenseStartDateField,
        licenseEndDate: this.licenseEndDateField,
      }
    })
  }

  private loadTerms() {
    this.serviceDataService
      .loadByCaseType(this.model.caseType)
      .pipe(tap(service => {
        this.servicePublicTerms = service.serviceTerms
      }))
      .pipe(switchMap(_ => {
        return this.loadUserCustomTerms()
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe()
  }

  saveApprovalInfo() {
    if (!this.license) {
      return;
    }
    const form = {...this.form.getRawValue()} as LicenseApprovalInterface;
    this.saveInfo.emit(this.license.clone({
      ...form,
      followUpDate: form.followUpDate ? DateUtils.getDateStringFromDate(form.followUpDate) : '',
      licenseStartDate: form.licenseStartDate ? DateUtils.getDateStringFromDate(form.licenseStartDate) : '',
      licenseEndDate: form.licenseEndDate ? DateUtils.getDateStringFromDate(form.licenseEndDate) : ''
    }))
  }

  private listenToLicenseChange() {
    this._license$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        val ? this.updateForm(val) : this.form.reset();
      })
  }

  private afterBuildForm() {
    this.licenseEndDateField.setValidators((this.model.licenseDurationType === LicenseDurationType.PERMANENT ? CustomValidators.required : null))
  }
}
