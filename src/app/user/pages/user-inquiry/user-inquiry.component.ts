import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {BeneficiaryService} from '../../../services/beneficiary.service';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {forkJoin, of, Subject} from 'rxjs';
import {catchError, filter, mergeMap, switchMap, takeUntil, tap} from 'rxjs/operators';
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
import {isValidValue, printBlobData} from '../../../helpers/utils';
import {AdminResult} from '../../../models/admin-result';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {IKeyValue} from '../../../interfaces/i-key-value';

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
  gulfCountries: Lookup[] = this.lookupService.listByCategory.GulfCountries;
  displayIdCriteria: boolean = false;
  beneficiary?: Beneficiary;
  requests: SubventionRequestAid[] = [];
  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId,
  };
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  identificationMap = {
    primary: 1,
    secondary: 2
  }
  identifications = [
    AdminResult.createInstance({
      id: 1,
      arName: this.langService.getArabicLocalByKey('beneficiary_primary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_primary_id'),
      lookupKey: this.identificationMap.primary
    }),
    AdminResult.createInstance({
      id: 2,
      arName: this.langService.getArabicLocalByKey('beneficiary_secondary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_secondary_id'),
      lookupKey: this.identificationMap.secondary
    })
  ];
  nationalityVisible: boolean = false;
  nationalityListType: 'normal' | 'gulf' = 'normal';
  readonlyForm: boolean = false;
  routeParams: IKeyValue = {};

  constructor(private fb: FormBuilder,
              public langService: LangService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private subventionRequestService: SubventionRequestService,
              private subventionRequestAidService: SubventionRequestAidService,
              private beneficiaryService: BeneficiaryService,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.buildPageForm();
    this.listenToInquiryTypeChange();
    this.listenToIdTypeChange();
    this.listenToSearch();
    this.listenToRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  get currentForm(): FormGroup | null {
    return <FormGroup>this.fm.getFormField(this.displayIdCriteria ? 'searchById' : 'searchByName');
  }

  private buildPageForm(): void {
    this.form = this.fb.group({
      inquiryType: [false, Validators.required],
      searchById: this.fb.group({
        identification: [1, [CustomValidators.required]],
        idType: [1, [CustomValidators.required]],
        nationality: [1],
        idNumber: [null, [CustomValidators.required].concat(this.idTypesValidationsMap[1])]
      }),
      searchByName: this.fb.group({
        operator: [1],
        arName: [''],
        enName: [''],
      }, {validators: CustomValidators.anyFieldsHasLength(['arName', 'enName'])})
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  private listenToRouteParams(): void {
    this.activeRoute.paramMap.pipe(
      filter(params => params.keys.length > 0),
      tap((params: ParamMap) => {
        // @ts-ignore
        this.routeParams = params.params;
        if (this.routeParams.idNumber) {
          this.readonlyForm = true;
          this.inquiryTypeField?.setValue(true);  // set inquiry type to search by id
          this.identificationField?.setValue(this.identificationMap.primary); // set identification to primary
          this.idNumberField?.setValue(this.routeParams.idNumber); // set number
          this.idTypeField?.setValue(Number(this.routeParams.idType)); // set id type from request params
        }
      }),
      switchMap((params) => {
        if (this.routeParams.idNumber) {
          this.search();
        }
        return of(params);
      })
    ).subscribe();
  }

  private listenToInquiryTypeChange() {
    this.inquiryTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.displayIdCriteria = value;
    });
  }

  get inquiryTypeField(): FormControl {
    return this.fm.getFormField('inquiryType') as FormControl;
  }

  get identificationField(): FormControl {
    return this.fm.getFormField('searchById.identification') as FormControl;
  }

  get idTypeField(): FormControl {
    return this.fm.getFormField('searchById.idType') as FormControl;
  }

  get idNumberField(): FormControl {
    return this.fm.getFormField('searchById.idNumber') as FormControl;
  }

  get nationalityField(): FormControl {
    return this.fm.getFormField('searchById.nationality') as FormControl;
  }

  private listenToIdTypeChange() {
    this.idTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      let nationalityValidators = null;
      if (value === BeneficiaryIdTypes.PASSPORT || value === BeneficiaryIdTypes.GCC_ID) {
        nationalityValidators = [CustomValidators.required];
      }

      this.idNumberField.setValidators([CustomValidators.required].concat(this.idTypesValidationsMap[value]));
      this.idNumberField.updateValueAndValidity();

      this.nationalityVisible = (value === BeneficiaryIdTypes.PASSPORT || value === BeneficiaryIdTypes.GCC_ID);
      this.nationalityListType = (value === BeneficiaryIdTypes.GCC_ID ? 'gulf' : 'normal');

      let nationality = null;
      if (this.readonlyForm && this.routeParams.hasOwnProperty('nationality') && isValidValue(this.routeParams.nationality)) {
        nationality = Number(this.routeParams.nationality);
      }
      this.nationalityField.setValue(nationality);
      this.nationalityField.setValidators(nationalityValidators);
      this.nationalityField.updateValueAndValidity();
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

    let beneficiary = {} as Partial<IBeneficiaryCriteria>;
    if (formValue.identification === this.identificationMap.primary) {
      beneficiary.benPrimaryIdType = formValue.idType;
      beneficiary.benPrimaryIdNumber = formValue.idNumber;
      if (formValue.idType === BeneficiaryIdTypes.PASSPORT || formValue.idType === BeneficiaryIdTypes.GCC_ID) {
        beneficiary.benPrimaryIdNationality = formValue.nationality;
      }
    } else {
      beneficiary.benSecIdType = formValue.idType;
      beneficiary.benSecIdNumber = formValue.idNumber;
      if (formValue.idType === BeneficiaryIdTypes.PASSPORT || formValue.idType === BeneficiaryIdTypes.GCC_ID) {
        beneficiary.benSecIdNationality = formValue.nationality;
      }
    }
    return beneficiary;
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
        {
          idType: 1,
          identification: this.identificationMap.primary,
          nationality: 1
        }
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
