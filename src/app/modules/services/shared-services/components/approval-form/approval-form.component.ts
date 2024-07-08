import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { HasLicenseApproval } from "@contracts/has-license-approval";
import { LangService } from "@services/lang.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { CustomTerm } from "@models/custom-term";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { CustomTermService } from "@services/custom-term.service";
import { CustomTermPopupComponent } from "@app/shared/popups/custom-term-popup/custom-term-popup.component";
import { DialogService } from "@services/dialog.service";
import { IKeyValue } from "@contracts/i-key-value";
import { DateUtils } from "@helpers/date-utils";
import { ServiceDataService } from "@services/service-data.service";
import { CollectionItem } from "@models/collection-item";
import { LicenseDurationType } from "@enums/license-duration-type";
import { CustomValidators } from "@app/validators/custom-validators";
import { CaseModel } from "@models/case-model";
import { HasLicenseDurationType } from "@contracts/has-license-duration-type";
import { HasRequestType } from '@contracts/has-request-type';
import { ServiceRequestTypes } from '@enums/service-request-types';
import { CommonUtils } from '@helpers/common-utils';
import { LicenseService } from "@services/license.service";
import { CaseTypes } from "@enums/case-types.enum";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";

@Component({
  selector: 'approval-form',
  templateUrl: './approval-form.component.html',
  styleUrls: ['./approval-form.component.scss']
})
export class ApprovalFormComponent implements OnInit, OnDestroy {
  @Input()
  model!: HasRequestType & HasLicenseDurationType & CaseModel<any, any> & {publicTerms:string};
  @Input()
  service!: BaseGenericEService<any>
  destroy$: Subject<void> = new Subject();
  form!: UntypedFormGroup

  customTerms: CustomTerm[] = [];

  servicePublicTerms: string = '';
  @Output()
  formCancel: EventEmitter<null> = new EventEmitter<null>();

  _license$: BehaviorSubject<HasLicenseApproval | null> = new BehaviorSubject<HasLicenseApproval | null>(null)

  @Output()
  saveInfo: EventEmitter<HasLicenseApproval> = new EventEmitter<HasLicenseApproval>();

  @Input()
  multi: boolean = true;

  @Input()
  set license(val: HasLicenseApproval | null) {
    this._license$.next(val);
  }

  get license(): HasLicenseApproval | null {
    return this._license$.value;
  }

  datepickerOptionsMap: IKeyValue = {
    licenseStartDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' })
  };
  minLicenseMonths!: number;
  maxLicenseMonths!: number;

  constructor(private fb: UntypedFormBuilder,
              private customTermService: CustomTermService,
              private dialog: DialogService,
              private serviceDataService: ServiceDataService,
              private licenseService: LicenseService,
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
    this.handleStartDateValidations();
  }

  private handleStartDateValidations() {
    if (this.model.requestType === ServiceRequestTypes.CANCEL) {
      this.licenseStartDateField.setValidators(null);
      this.licenseStartDateField.disable();
    }
  }

  private updateForm(model: HasLicenseApproval): void {
    this.form.patchValue(model.clone<CollectionItem>({ publicTerms: model.publicTerms ? model.publicTerms : this.servicePublicTerms }).buildApprovalForm(false))
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

  private loadTerms() {
    this.serviceDataService
      .loadByCaseType(this.model.caseType)
      .pipe(tap(service => {
        this.minLicenseMonths = service.licenseMinTime;
        this.maxLicenseMonths = service.licenseMaxTime;
      }))
      .pipe(tap(service => {
        this.servicePublicTerms = service.serviceTerms
        this.model.publicTerms = service.serviceTerms
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
    this.applyLicenseEndDateValidationAndStatus();
  }

  private isPermanent(): boolean {
    return this.model.licenseDurationType === LicenseDurationType.PERMANENT;
  }

  private applyLicenseEndDateValidationAndStatus(): void {
    this.licenseEndDateField.setValidators((this.isPermanent() ? null : CustomValidators.required))
    this.isPermanent() ? this.licenseEndDateField.disable() : this.licenseEndDateField.enable();

    if (this.model.requestType === ServiceRequestTypes.UPDATE) {
      this.licenseEndDateField.disable()
      this.licenseStartDateField.disable()
    }
  }

  private validateLicenseDateRange(startDate: string, endDate: string) {
    if (!this.isPermanent() && startDate) {
      if (CommonUtils.isValidValue(this.minLicenseMonths) && CommonUtils.isValidValue(this.maxLicenseMonths) && this.minLicenseMonths > 0 && this.maxLicenseMonths > 0) {
        let licenseDuration = DateUtils.getDifference(startDate, endDate, 'month');// (dayjs(endDate).diff(startDate, 'month'));
        return licenseDuration >= this.minLicenseMonths && licenseDuration <= this.maxLicenseMonths;
      }
      return true;
    }
    return true;
  }

  saveApprovalInfo(skipValidateDateRange: boolean = false) {
    if (!this.license) {
      return;
    }
    const form = { ...this.form.getRawValue() } as HasLicenseApproval,
      value = this.license.clone({
        ...form,
        followUpDate: DateUtils.getDateStringFromDate(form.followUpDate),
        licenseStartDate: DateUtils.getDateStringFromDate(form.licenseStartDate),
        licenseEndDate: DateUtils.getDateStringFromDate(form.licenseEndDate)
      });

    if ([CaseTypes.COLLECTION_APPROVAL, CaseTypes.COLLECTOR_LICENSING].includes(this.model.caseType)) {
      const collectionValidate = this.licenseService
        .validateMultiLicenseCollection(this.model.caseType, { ...this.model, collectionItemList: [value] })
      const collectorValidate = this.licenseService
        .validateMultiLicenseCollector(this.model.caseType, { ...this.model, collectorItemList: [value] })
      const validate = CaseTypes.COLLECTION_APPROVAL === this.model.caseType ? collectionValidate : collectorValidate;
      validate
        .subscribe(() => {
          this.processSaveInfo(skipValidateDateRange, value)
        })
    } else {
      this.processSaveInfo(skipValidateDateRange, value)
    }
  }

  private processSaveInfo(skipValidateDateRange: boolean, value: HasLicenseApproval): void {
    if (skipValidateDateRange) {
      this.saveInfo.emit(value);
      return;
    }

    if (!this.validateLicenseDateRange(value.licenseStartDate, value.licenseEndDate as string)) {
      this.dialog.error(this.lang.map.msg_license_duration_diff_between_x_and_y_months.change({
        x: this.minLicenseMonths,
        y: this.maxLicenseMonths
      }));
    } else {
      this.saveInfo.emit(value);
    }
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
}
