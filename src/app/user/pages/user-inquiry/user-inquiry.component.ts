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
import {EmployeeService} from '../../../services/employee.service';
import {ECookieService} from '../../../services/e-cookie.service';

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
  idTypesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  nationalitiesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
  gulfCountries: Lookup[] = this.lookupService.listByCategory.GulfCountries;
  gulfCountriesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
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
  identifications: AdminResult[] = [
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
  identificationsLookup: Record<number, AdminResult> = {} as Record<number, AdminResult>;
  nationalityVisible: boolean = false;
  nationalityListType: 'normal' | 'gulf' = 'normal';

  routeParams: IKeyValue = {};
  isNormalBenSearch: boolean = false;
  isBenSearchFromRequest: boolean = false;
  searchByNamePermission: boolean = false;

  constructor(private fb: FormBuilder,
              public langService: LangService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private subventionRequestService: SubventionRequestService,
              private subventionRequestAidService: SubventionRequestAidService,
              private beneficiaryService: BeneficiaryService,
              private activeRoute: ActivatedRoute,
              private empService: EmployeeService,
              private eCookieService: ECookieService) {
    this.searchByNamePermission = empService.checkPermissions('BEN_SEARCH_NAME');
    this.prepareLookups();
  }

  ngOnInit(): void {
    this.buildPageForm();
    this.listenToInquiryTypeChange();
    this.listenToIdTypeChange();
    this.listenToSearch();
    this.listenToCookies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private prepareLookups(): void {
    this.idTypesLookup = this.idTypes.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, this.idTypesLookup);
    this.nationalitiesLookup = this.nationalities.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, this.nationalitiesLookup);
    this.gulfCountriesLookup = this.gulfCountries.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, this.gulfCountriesLookup);
    this.identificationsLookup = this.identifications.reduce((acc, item) => {
      return {...acc, [item.lookupKey!]: item};
    }, this.identificationsLookup);
  }

  get currentForm(): FormGroup | null {
    return <FormGroup>this.fm.getFormField(this.displayIdCriteria ? 'searchById' : 'searchByName');
  }

  private buildPageForm(): void {
    this.form = this.fb.group({
      inquiryType: [!this.searchByNamePermission, Validators.required],
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

  private listenToCookies(): void {
    this.routeParams = this.eCookieService.getEObject(this.activeRoute.snapshot.data.cookieKey) as IKeyValue;
    this.eCookieService.removeE(this.activeRoute.snapshot.data.cookieKey);

    const routeName = this._getRouteName(this.activeRoute).toLowerCase();
    if (routeName === 'inquiries') {
      this.isNormalBenSearch = true;
      this.isBenSearchFromRequest = false;
    } else if (routeName === 'inquiry') {
      this.isNormalBenSearch = false;
      this.isBenSearchFromRequest = true;
      this.inquiryTypeField?.setValue(true);  // set inquiry type to search by id
      this.identificationField?.setValue(this.identificationMap.primary); // set identification to primary
      this.idNumberField?.setValue(this.routeParams.idNumber); // set number
      this.idTypeField?.setValue(Number(this.routeParams.idType)); // set id type from request params
      this.search();
    }
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
      if (this.isBenSearchFromRequest && this.routeParams.hasOwnProperty('nationality') && isValidValue(this.routeParams.nationality)) {
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
    this.routeParams = {};
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
    } else if (beneficiaries.length === 1) {
      return this.subventionRequestAidService.loadByBeneficiaryId(beneficiaries[0].id)
        .subscribe((requestsResult) => {
          this.beneficiary = beneficiaries[0];
          this.requests = requestsResult;
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

  private _getRouteName(route: ActivatedRoute): string {
    let routeName = '';
    if (route && route.hasOwnProperty('snapshot') && route.snapshot.hasOwnProperty('data')) {
      routeName = route.snapshot.data.routeName;
    }
    return routeName;
  }
}
