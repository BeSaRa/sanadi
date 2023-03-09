import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {CaseModel} from "@models/case-model";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {CustomTerm} from "@models/custom-term";
import {IKeyValue} from "@contracts/i-key-value";
import {DateUtils} from "@helpers/date-utils";
import {CustomTermService} from "@services/custom-term.service";
import {DialogService} from "@services/dialog.service";
import {ServiceDataService} from "@services/service-data.service";
import {LangService} from "@services/lang.service";
import {switchMap, takeUntil, tap} from "rxjs/operators";
import {CustomTermPopupComponent} from "@app/shared/popups/custom-term-popup/custom-term-popup.component";
import {HasLicenseDurationMonthly} from "@contracts/has-license-duration-monthly";
import {HasLicenseApprovalMonthly} from "@contracts/has-license-approval-monthly";
import {mixinApprovalLicenseWithMonthly} from "@app/mixins/mixin-approval-license-with-monthly";
import {Constructor} from "@helpers/constructor";
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {CustomValidators} from "@app/validators/custom-validators";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'approval-form-monthly',
  templateUrl: './approval-form-monthly.component.html',
  styleUrls: ['./approval-form-monthly.component.scss']
})
export class ApprovalFormMonthlyComponent implements OnInit, OnDestroy {
  @Input()
  model!: HasLicenseDurationMonthly & CaseModel<any, any>;
  @Input()
  service!: BaseGenericEService<any>
  destroy$: Subject<any> = new Subject();
  form!: UntypedFormGroup

  customTerms: CustomTerm[] = [];

  servicePublicTerms: string = '';
  @Output()
  formCancel: EventEmitter<null> = new EventEmitter<null>();

  _license$: BehaviorSubject<HasLicenseApprovalMonthly | null> = new BehaviorSubject<HasLicenseApprovalMonthly | null>(null)

  @Output()
  saveInfo: EventEmitter<HasLicenseApprovalMonthly> = new EventEmitter<HasLicenseApprovalMonthly>();

  @Input()
  multi: boolean = true;

  @Input()
  disableStartDate: boolean = false;

  @Input()
  set license(val: HasLicenseApprovalMonthly | null) {
    this._license$.next(val);
  }

  get license(): HasLicenseApprovalMonthly | null {
    return this._license$.value;
  }

  @Input()
  licenseStartDateMandatory: boolean = true;

  datepickerOptionsMap: IKeyValue = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past', appendToBody: true})
  };

  @Input()
  template?: TemplateRef<any>;
  @Input()
  displayDuration: boolean = true;

  constructor(private fb: UntypedFormBuilder,
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
    const LicenseApprovalMonthly = mixinApprovalLicenseWithMonthly(class {
    }) as Constructor<HasLicenseApprovalMonthly>;

    this.form = this.fb.group((new LicenseApprovalMonthly).buildApprovalForm(true));
  }

  private updateForm(model: HasLicenseApprovalMonthly): void {
    this.form.patchValue(model.clone<HasLicenseApprovalMonthly>({publicTerms: model.publicTerms ? model.publicTerms : this.servicePublicTerms}).buildApprovalForm(false))
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

  get licenseDuration(): AbstractControl {
    return this.form.get('licenseDuration')!;
  }

  get publicTerms(): AbstractControl {
    return this.form.get('publicTerms')!
  }

  get conditionalLicenseField(): AbstractControl {
    return this.form.get('conditionalLicenseIndicator')!
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

  private listenToLicenseChange() {
    this._license$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        val ? this.updateForm(val) : this.form.reset();
      })
  }

  private afterBuildForm() {
    const startDate = this.form.get('licenseStartDate')!
    !this.licenseStartDateMandatory ? startDate.removeValidators(CustomValidators.required) : null
    this.disableStartDate ? startDate.disable() : startDate.enable()
    startDate.updateValueAndValidity()
  }

  saveApprovalInfo() {
    if (!this.license) {
      return;
    }
    const form = {...this.form.getRawValue()} as HasLicenseApprovalMonthly;
    this.saveInfo.emit(this.license.clone({
      ...form,
      followUpDate: form.followUpDate ? DateUtils.getDateStringFromDate(form.followUpDate) : '',
      licenseStartDate: form.licenseStartDate ? DateUtils.getDateStringFromDate(form.licenseStartDate) : '',
    }))
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

}
