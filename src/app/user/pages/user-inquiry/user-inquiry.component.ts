import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {BeneficiaryService} from '../../../services/beneficiary.service';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {forkJoin, of, Subject} from 'rxjs';
import {catchError, mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {CustomValidators} from '../../../validators/custom-validators';
import {BeneficiaryIdTypes} from '../../../enums/beneficiary-id-types.enum';
import {IBeneficiaryCriteria} from '../../../interfaces/i-beneficiary-criteria';
import {StringOperator} from '../../../enums/string-operator.enum';
import {Beneficiary} from '../../../models/beneficiary';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {SubventionRequestAidService} from '../../../services/subvention-request-aid.service';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {printBlobData} from '../../../helpers/utils';

@Component({
  selector: 'app-user-inquiry',
  templateUrl: './user-inquiry.component.html',
  styleUrls: ['./user-inquiry.component.scss']
})
export class UserInquiryComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private search$: Subject<any> = new Subject<any>();
  form !: FormGroup;
  fm!: FormManager;
  stringOperators: Lookup[] = this.lookupService.getStringOperators();
  idTypes: Lookup[] = this.lookupService.listByCategory.BenIdType;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  displayIdCriteria: boolean = false;
  displayNationality: boolean = false;
  beneficiary?: Beneficiary;
  requests: SubventionRequestAid[] = [];
  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId,
  };

  constructor(private fb: FormBuilder,
              public langService: LangService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private subventionRequestService: SubventionRequestService,
              private subventionRequestAidService: SubventionRequestAidService,
              private beneficiaryService: BeneficiaryService) {
  }

  ngOnInit(): void {
    this.buildPageForm();
    this.listenToInquiryTypeChange();
    this.listenToIdTypeChange();
    this.listenToSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get currentForm(): FormGroup | null {
    return <FormGroup> this.fm.getFormField(this.displayIdCriteria ? 'searchById' : 'searchByName');
  }

  private buildPageForm(): void {
    this.form = this.fb.group({
      inquiryType: [false, Validators.required],
      searchById: this.fb.group({
        benPrimaryIdNationality: [1],
        benPrimaryIdType: [1],
        benPrimaryIdNumber: [null, this.idTypesValidationsMap[1]]
      }),
      searchByName: this.fb.group({
        operator: [1],
        arName: [''],
        enName: [''],
      }, {validators: CustomValidators.anyFieldsHasLength(['arName', 'enName'])})
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  private listenToInquiryTypeChange() {
    this.fm.getFormField('inquiryType')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.displayIdCriteria = value;
    });
  }

  get primaryIdNumberField(): FormControl {
    return this.fm.getFormField('searchById.benPrimaryIdNumber') as FormControl;
  }

  private listenToIdTypeChange() {
    this.fm.getFormField('searchById.benPrimaryIdType')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      // set validation for it if need.
      this.primaryIdNumberField.setValidators(this.idTypesValidationsMap[value]);
      this.primaryIdNumberField.updateValueAndValidity();
      this.displayNationality = value === BeneficiaryIdTypes.PASSPORT;
    });
  }

  private prepareSearchByName(): Partial<IBeneficiaryCriteria> {
    return {
      arName: {
        value: this.currentForm?.controls.arName.value,
        operator: StringOperator[this.currentForm?.controls.operator.value],
      },
      enName: {
        value: this.currentForm?.controls.enName.value,
        operator: StringOperator[this.currentForm?.controls.operator.value],
      }
    };
  }

  private prepareSearchById(): Partial<IBeneficiaryCriteria> {
    let formValue = {...this.currentForm?.value};
    if (formValue.benPrimaryIdType !== BeneficiaryIdTypes.PASSPORT) {
      delete formValue.benPrimaryIdNationality;
    }
    return formValue;
  }

  private getCurrentFormValue(): Partial<IBeneficiaryCriteria> {
    return this.displayIdCriteria ? this.prepareSearchById() : this.prepareSearchByName();
  }

  private listenToSearch() {
    this.search$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.beneficiaryService.loadByCriteria(this.getCurrentFormValue())
            .pipe(catchError(_ => of([])));
        })
      )
      .subscribe((beneficiaries: Beneficiary[]) => {
        this.displaySelectBeneficiary(beneficiaries);
      });
  }

  search() {
    this.search$.next(this.currentForm?.value);
  }

  resetCurrentForm() {
    this.currentForm?.reset(
      this.displayIdCriteria ?
        {benPrimaryIdType: this.currentForm?.controls.benPrimaryIdType.value}
        : {operator: this.currentForm?.controls.operator.value}
    );

    this.requests = [];
    this.beneficiary = undefined;
  }


  private displaySelectBeneficiary(beneficiaries: Beneficiary[]): any {
    if (!beneficiaries.length) {
      return this.dialogService.info(this.langService.map.no_result_for_your_search_criteria).onAfterClose$.subscribe(() => {
        this.beneficiary = undefined;
        this.requests = [];
      });
    }

    this.beneficiaryService
      .openSelectBeneficiaryDialog(beneficiaries)
      .onAfterClose$
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((value: Beneficiary & UserClickOn) => {
          return forkJoin({
            beneficiary: of(value === UserClickOn.CLOSE ? undefined : value),
            requests: value === UserClickOn.CLOSE ? of([]) : this.subventionRequestAidService.loadByBeneficiaryId(value.id)
          });
        })
      )
      .subscribe((result) => {
        this.beneficiary = result.beneficiary;
        this.requests = result.requests;
      });
  }

  printResult(): void {
    // @ts-ignore
    this.subventionRequestService.loadByBeneficiaryIdAsBlob(this.beneficiary?.id)
      .subscribe((data) => {
        printBlobData(data, 'InquiryByCriteriaSearchResult.pdf');
      });
  }

  printRequest($event: MouseEvent, request: SubventionRequestAid): void {
    $event.preventDefault();
    request.printRequest('InquiryByIdSearchResult.pdf');
  }
}
