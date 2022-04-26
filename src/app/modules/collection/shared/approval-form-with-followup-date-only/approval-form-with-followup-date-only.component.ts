import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaseModel} from '@app/models/case-model';
import {EServiceGenericService} from '@app/generics/e-service-generic-service';
import {BehaviorSubject, Subject} from 'rxjs';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {HasLicenseApproval} from '@app/interfaces/has-license-approval';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {DialogService} from '@app/services/dialog.service';
import {ServiceDataService} from '@app/services/service-data.service';
import {LangService} from '@app/services/lang.service';
import {takeUntil} from 'rxjs/operators';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'approval-form-with-followup-date-only',
  templateUrl: './approval-form-with-followup-date-only.component.html',
  styleUrls: ['./approval-form-with-followup-date-only.component.scss']
})
export class ApprovalFormWithFollowupDateOnlyComponent implements OnInit {
  @Input()
  model!: CaseModel<any, any>;
  @Input()
  service!: EServiceGenericService<any>
  destroy$: Subject<any> = new Subject();
  form!: FormGroup

  @Output()
  formCancel: EventEmitter<null> = new EventEmitter<null>();

  _license$: BehaviorSubject<InternalBankAccountApproval | null> = new BehaviorSubject<InternalBankAccountApproval | null>(null)

  @Output()
  saveInfo: EventEmitter<InternalBankAccountApproval> = new EventEmitter<InternalBankAccountApproval>();

  @Input()
  multi: boolean = true;

  @Input()
  set license(val: InternalBankAccountApproval | null) {
    this._license$.next(val);
  }

  get license(): InternalBankAccountApproval | null {
    return this._license$.value;
  }

  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'})
  };

  constructor(private fb: FormBuilder,
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
    this.listenToLicenseChange();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      followUpDate: [null, CustomValidators.required]
    });
  }

  private updateForm(model: InternalBankAccountApproval): void {
    this.form.patchValue({followUpDate: model.followUpDate});
  }

  get conditionalLicenseField(): AbstractControl {
    return this.form.get('conditionalLicenseIndicator')!
  }

  private listenToLicenseChange() {
    this._license$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        val ? this.updateForm(val) : this.form.reset();
      })
  }

  private afterBuildForm() {

  }

  saveApprovalInfo() {
    if (!this.license) {
      return;
    }
    const form = {...this.form.getRawValue()} as HasLicenseApproval;
    const date = DateUtils.getDateStringFromDate(form.followUpDate);
    this.saveInfo.emit(this.license.clone({
      ...form,
      followUpDate: form.followUpDate ? DateUtils.getDateStringFromDate(form.followUpDate) : ''
    }))
  }
}
