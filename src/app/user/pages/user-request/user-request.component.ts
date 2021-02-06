import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {DialogService} from '../../../services/dialog.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, take, takeUntil, tap} from 'rxjs/operators';
import {BeneficiaryService} from '../../../services/beneficiary.service';
import {Beneficiary} from '../../../models/beneficiary';
import {ConfigurationService} from '../../../services/configuration.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private idMap: { [index: string]: number } = {
    qid: 1,
    gccId: 3,
    visa: 6,
    passport: 5,
  };
  fm!: FormManager;
  form!: FormGroup;
  idNumbersChanges$: Subject<{ field: string, value: string }> = new Subject<{ field: string, value: string }>();
  idFieldsClearButtons: { [index: string]: boolean } = {
    qid: false,
    visa: false,
    passport: false,
    gccId: false
  };
  private selectedBeneficiary?: Beneficiary;
  private beneficiaryChanged$: Subject<Beneficiary | null> = new Subject<Beneficiary | null>();
  private beneficiaryLoaded$: Subject<Beneficiary> = new Subject<Beneficiary>();

  constructor(public langService: LangService,
              public lookup: LookupService,
              private beneficiaryService: BeneficiaryService,
              private dialogService: DialogService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private fb: FormBuilder) {

  }


  private buildForm(beneficiary ?: Beneficiary) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    this.form = this.fb.group({
      idTypes: this.fb.group({
        passport: [],
        visa: [],
        qid: [],
        gccId: []
      }),
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      incomeTab: this.fb.group(beneficiary.getEmployerFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group({}),
      aidTab: this.fb.group({}),
      requestStatusTab: this.fb.group({})
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  private listenToIdNumberChange() {
    this.idNumbersChanges$
      .pipe(
        takeUntil(this.destroy$),
        tap(field => field.field === 'passport' ? this.updateSecondaryIdNumber(field) : null),
        filter(field => field.field !== 'passport'),
        distinctUntilChanged()
      )
      .subscribe((field) => {
        if (field.value.length) {
          this.disableOtherIdFieldsExcept(field.field);
          this.setIbNumberAndIdTypeValues(field);
        } else {
          this.enableAllIdFields();
        }
      });
  }

  private setIbNumberAndIdTypeValues(field: { field: string, value: string }): void {
    if (field.value) {
      this.fm.getFormField('personalTab.benPrimaryIdNumber')?.setValue(field.value);
      this.fm.getFormField('personalTab.benPrimaryIdType')?.setValue(this.idMap[field.field]);
    } else {
      this.fm.getFormField('personalTab.benPrimaryIdNumber')?.setValue(null);
      this.fm.getFormField('personalTab.benPrimaryIdType')?.setValue(null);
    }
  }

  private disableOtherIdFieldsExcept(fieldName: string): void {
    ['qid', 'visa', 'gccId'].forEach(field => {
      const fieldPath = `idTypes.${field}`;
      field !== fieldName ? this.fm.getFormField(fieldPath)?.disable() : this.fm.getFormField(fieldPath)?.enable();
      field !== fieldName ? this.idFieldsClearButtons[field] = false : this.idFieldsClearButtons[field] = true;
    });
  }

  private enableAllIdFields(): void {
    ['qid', 'visa', 'gccId'].forEach(field => {
      const fieldPath = `idTypes.${field}`;
      this.fm.getFormField(fieldPath)?.enable();
      this.idFieldsClearButtons[field] = false;
    });
    this.setIbNumberAndIdTypeValues({
      value: '',
      field: ''
    });
  }

  private listenToBeneficiaryChange() {
    this.beneficiaryChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((beneficiary) => {
        if (beneficiary instanceof Beneficiary) {
          this.selectedBeneficiary = beneficiary;
        } else {
          this.selectedBeneficiary = undefined;
        }
        this.updateBeneficiaryFrom(this.selectedBeneficiary);
      });
  }

  private updateBeneficiaryFrom(selectedBeneficiary: undefined | Beneficiary) {
    if (!selectedBeneficiary) {
      this.fm.getFormField('personalTab')?.reset();
    } else {
      this.fm.getFormField('personalTab')?.patchValue(selectedBeneficiary.getPersonalFields());
    }

  }


  private listenToBeneficiaryLoaded() {
    this.beneficiaryLoaded$
      .pipe(takeUntil(this.destroy$))
      .subscribe((beneficiary) => {
        for (const key in this.idMap) {
          if (this.idMap[key] === beneficiary.benPrimaryIdType) {
            this.updateIdsForms(key, beneficiary.benPrimaryIdNumber);
            this.updateIdsForms('passport', beneficiary.benSecIdNumber);
            break;
          }
        }
      });
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToIdNumberChange();
    this.listenToBeneficiaryChange();
    this.listenToBeneficiaryLoaded();
    this.listenToOccupationStatus();
    this.listenToExtraIncome();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  saveModel() {
    if (this.fm.getForm()?.invalid) {
      this.dialogService.error(this.langService.map.msg_all_required_fields_are_filled).onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.fm.displayFormValidity();
        });
      return;
    }
    const personal = this.fm.getFormField('personalTab')?.value;
    const income = this.fm.getFormField('incomeTab')?.value;
    const address = this.fm.getFormField('addressTab')?.value;

    if (this.selectedBeneficiary) {
      this.selectedBeneficiary = (new Beneficiary()).clone({...this.selectedBeneficiary, ...personal, ...income, ...address});

      this.selectedBeneficiary.save().subscribe(() => {
        this.toastService.success('!HI ALL EVERY Thing Updated Successfully !');
      });
    }

  }

  getBeneficiaryData(fieldName: string) {
    const primaryNumber = this.fm.getFormField('personalTab.benPrimaryIdNumber')?.value;
    const secondary = this.fm.getFormField('personalTab.benSecIdNumber')?.value;

    console.log(secondary ? secondary : undefined, secondary ? this.idMap['passport'] : undefined);

    this.beneficiaryService
      .loadByCriteria({
        benPrimaryIdNumber: primaryNumber ? primaryNumber : undefined,
        benPrimaryIdType: primaryNumber ? this.idMap[fieldName] : undefined,
        benSecIdNumber: secondary ? secondary : undefined,
        benSecIdType: secondary ? this.idMap['passport'] : undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        if (!list.length) {
          return this.beneficiaryChanged$.next(null);
        }
        list.length > 1 ? this.beneficiaryService.openSelectBeneficiaryDialog(list) : this.beneficiaryChanged$.next(list[0]);
      });
  }

  clearField(fieldName: string) {
    const field = this.fm.getFormField(`idTypes.${fieldName}`);
    field?.patchValue(null);
    this.idFieldsClearButtons[fieldName] = false;
    this.enableAllIdFields();
    this.beneficiaryChanged$.next(null);
  }

  isActiveIdField(fieldName: string) {
    return this.idFieldsClearButtons.hasOwnProperty(fieldName) && this.idFieldsClearButtons[fieldName];
  }

  fieldChange(event: KeyboardEvent): void {
    const element = event.target as HTMLInputElement;
    if (event.code === 'NumpadEnter' || event.code === 'Enter' && element.value.trim().length) {
      event.preventDefault();
      this.getBeneficiaryData(element.id);
      return;
    }
    this.idNumbersChanges$.next({
      field: element.id,
      value: (element.value + '').trim()
    });
  }

  private updateIdsForms(key: string, value: string) {
    const field = `idTypes.${key}`;
    if (key !== 'passport') {
      this.disableOtherIdFieldsExcept(key);
    }
    this.fm.getFormField(field)?.setValue(value);
    this.fm.getFormField(field)?.updateValueAndValidity();
  }

  private updateSecondaryIdNumber(field: { field: string, value: string }): void {
    this.fm.getFormField('personalTab.benSecIdNumber')?.setValue(field.value);
    this.fm.getFormField('personalTab.benSecIdType')?.setValue(field.value.length ? this.idMap[field.field] : null);
  }

  private listenToOccupationStatus() {
    const requiredList = ['occuption', 'employeerAddress', 'benIncome'];
    this.fm.getFormField('incomeTab.occuptionStatus')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        map(value => {
          return value !== this.configurationService.CONFIG.UNEMPLOYED_LOOKUP_KEY;
        }),
        distinctUntilChanged()
      )
      .subscribe((required) => {
        requiredList.forEach(field => {
          const control = this.fm.getFormField(`incomeTab.${field}`);
          control?.setValidators(required ? CustomValidators.required : null);
          control?.updateValueAndValidity();
        });
      });
  }

  private listenToExtraIncome() {
    this.fm.getFormField('incomeTab.benExtraIncome')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      const control = this.fm.getFormField('incomeTab.benExtraIncomeSource');
      value ? control?.setValidators(CustomValidators.required) : null;
      control?.updateValueAndValidity();
    });
  }
}
