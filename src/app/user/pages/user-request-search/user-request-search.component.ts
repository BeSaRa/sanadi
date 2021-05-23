import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {LangService} from '../../../services/lang.service';
import {SubventionRequestAid} from '../../../models/subvention-request-aid';
import {ConfigurationService} from '../../../services/configuration.service';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {StringOperator} from '../../../enums/string-operator.enum';
import {CustomValidators} from '../../../validators/custom-validators';
import {of, Subject, Subscription} from 'rxjs';
import {catchError, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ISubventionRequestCriteria} from '../../../interfaces/i-subvention-request-criteria';
import {IBeneficiaryCriteria} from '../../../interfaces/i-beneficiary-criteria';
import * as dayjs from 'dayjs';
import {DialogService} from '../../../services/dialog.service';
import {isEmptyObject, printBlobData} from '../../../helpers/utils';
import {
  changeDateFromDatepicker,
  getDatepickerOptions,
  getDatePickerOptionsClone
} from '../../../helpers/utils-date';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ToastService} from '../../../services/toast.service';
import {EmployeeService} from '../../../services/employee.service';
import {BeneficiaryIdTypes} from '../../../enums/beneficiary-id-types.enum';
import {IDatePickerDirectiveConfig} from 'ng2-date-picker';
import {ReadModeService} from '../../../services/read-mode.service';
import {IAngularMyDpOptions, IMyInputFieldChanged} from 'angular-mydatepicker';
import {IKeyValue} from '../../../interfaces/i-key-value';

@Component({
  selector: 'app-user-request-search',
  templateUrl: './user-request-search.component.html',
  styleUrls: ['./user-request-search.component.scss']
})
export class UserRequestSearchComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  tabIndex$: Subject<number> = new Subject<number>();
  years: number[] = this.configurationService.getSearchYears();
  idTypes: Lookup[] = this.lookupService.listByCategory.BenIdType;
  stringOperators: Lookup[] = this.lookupService.getStringOperators();
  requestTypes: Lookup[] = this.lookupService.listByCategory.SubRequestType;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  requestsStatus: Lookup[] = this.lookupService.listByCategory.SubRequestStatus;
  employmentStatus: Lookup[] = this.lookupService.listByCategory.BenOccuptionStatus;
  form: FormGroup = {} as FormGroup;
  fm: FormManager = {} as FormManager;
  stringOperationMap: typeof StringOperator = StringOperator;
  private search$: Subject<any> = new Subject<any>();
  searchSubscription!: Subscription;
  private latestCriteria: Partial<ISubventionRequestCriteria> = {} as Partial<ISubventionRequestCriteria>;
  private latestCriteriaString: string = '';
  private skipQueryParamSearch: boolean = true;
  requests: SubventionRequestAid[] = [];

  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId
  };

  dateConfig: IDatePickerDirectiveConfig = {
    format: this.configurationService.CONFIG.DATEPICKER_FORMAT,
    // disableKeypress: true
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  datepickerOptionsMap: IKeyValue = {
    creationDateFrom: getDatepickerOptions({disablePeriod: 'none'}),
    creationDateTo: getDatepickerOptions({disablePeriod: 'none'}),
    statusDateFrom: getDatepickerOptions({disablePeriod: 'none'}),
    statusDateTo: getDatepickerOptions({disablePeriod: 'none'}),
    statusDateModifiedFrom: getDatepickerOptions({disablePeriod: 'none'}),
    statusDateModifiedTo: getDatepickerOptions({disablePeriod: 'none'})
  }
  private datepickerFieldPathMap: IKeyValue = {
    creationDateFrom: 'advancedSearch.request.creationDateFrom',
    creationDateTo: 'advancedSearch.request.creationDateTo',
    statusDateFrom: 'advancedSearch.request.statusDateModifiedFrom',
    statusDateTo: 'advancedSearch.request.statusDateModifiedTo',
    statusDateModifiedFrom: 'advancedSearch.request.statusDateModifiedFrom',
    statusDateModifiedTo: 'advancedSearch.request.statusDateModifiedTo',
  };

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    this.setRelatedMinDate(fromFieldName, toFieldName);
    this.setRelatedMaxDate(fromFieldName, toFieldName);
  }

  constructor(public langService: LangService,
              private toastService: ToastService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private configurationService: ConfigurationService,
              private dialogService: DialogService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private readModeService: ReadModeService,
              private subventionRequestService: SubventionRequestService,
              public empService: EmployeeService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this.onIdTypeChange();

    this.listenToSearch();
    this.setInitialValues();
    this.listenToQueryParams();
  }

  listenToQueryParams(): void {
    this.skipQueryParamSearch = false;
    this.activatedRoute.queryParams.subscribe(params => {
      if (!this.skipQueryParamSearch) {
        if (params && params.hasOwnProperty('criteria') && params.criteria.trim().length > 0) {
          this.latestCriteriaString = params['criteria'];
          this.searchByQueryString();
        }
      }
    });
  }

  get getResultTabTitle(): string {
    return this.langService.map.search_result + (!this.requests.length ? '' : ' (' + this.requests.length + ')');
  }

  private buildForm() {
    this.form = this.fb.group({
      simpleSearch: this.fb.group({
        year: [],
        request: this.fb.group({
          requestSerial: [null, Validators.maxLength(50)]
        }),
        beneficiary: this.fb.group({
          benPrimaryIdType: [],
          benPrimaryIdNumber: [],
          benSecIdType: [],
          benSecIdNumber: [],
          arName: this.fb.group({
            value: [null, [CustomValidators.pattern('AR_NUM'), Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX)]],
            operator: [StringOperator[StringOperator.CONTAINS]],
          }),
          enName: this.fb.group({
            value: [null, [CustomValidators.pattern('ENG_NUM'), Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]],
            operator: [StringOperator[StringOperator.CONTAINS]]
          })
        })
      }),
      advancedSearch: this.fb.group({
        creationDates: this.fb.group({
          creationDateFrom: [],
          creationDateTo: [],
        }),
        request: this.fb.group({
          requestType: [],
          status: [],
          creationDateFrom: [],
          creationDateTo: [],
          statusDateModifiedFrom: [],
          statusDateModifiedTo: []
        }),
        beneficiary: this.fb.group({
          phoneNumber1: [null, [CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
          benNationality: [],
          occuptionStatus: []
        })
      })
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  get arNameField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.arName.value')! as FormControl;
  }

  get arNameOperatorField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.arName.operator')! as FormControl;
  }

  get enNameField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.enName.value') as FormControl;
  }

  get enNameOperatorField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.enName.operator') as FormControl;
  }

  get primaryIdTypeField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.benPrimaryIdType') as FormControl;
  }

  get secondaryIdTypeField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.benSecIdType') as FormControl;
  }

  get yearField(): FormControl {
    return this.fm.getFormField('simpleSearch.year')! as FormControl;
  }

  get creationDateFromField(): FormControl {
    return this.fm.getFormField('advancedSearch.creationDates.creationDateFrom') as FormControl;
  }

  get creationDateToField(): FormControl {
    return this.fm.getFormField('advancedSearch.creationDates.creationDateTo') as FormControl;
  }

  get primaryIdNumberField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.benPrimaryIdNumber') as FormControl;
  }

  get secondaryIdNumberField(): FormControl {
    return this.fm.getFormField('simpleSearch.beneficiary.benSecIdNumber') as FormControl;
  }

  isPrimaryIdTypeDisabled(optionValue: number): boolean {
    return this.secondaryIdTypeField?.value === optionValue;
  }

  isSecondaryIdTypeDisabled(optionValue: number): boolean {
    return this.primaryIdTypeField?.value === optionValue;
  }

  private onIdTypeChange() {
    this.primaryIdTypeField.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        // empty the idNumber
        this.primaryIdNumberField.setValue(null);
        // set validation for it if need.
        this.primaryIdNumberField.setValidators(this.idTypesValidationsMap[value]);
        this.primaryIdNumberField.updateValueAndValidity();
      });

    this.secondaryIdTypeField.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        // empty the idNumber
        this.secondaryIdNumberField.setValue(null);
        // set validation for it if need.
        this.secondaryIdNumberField.setValidators(this.idTypesValidationsMap[value]);
        this.secondaryIdNumberField.updateValueAndValidity();
      });
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      map(() => {
        return this.getAdvancedSearchValues();
      }),
      switchMap((criteria) => {
        return this.subventionRequestService.loadByCriteria(criteria)
          .pipe(catchError(() => {
            return of([]);
          }));
      }),
      tap((result: SubventionRequestAid[]) => {
        this.latestCriteriaString = this.subventionRequestService._parseObjectToQueryString({...this.latestCriteria});
        return result.length ? this.goToResult() : this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
      }),
      takeUntil(this.destroy$),
    ).subscribe(result => this.requests = result);
  }

  private searchByQueryString(): void {
    this.skipQueryParamSearch = true;
    this.subventionRequestService.loadByCriteria(this.latestCriteriaString)
      .pipe(
        catchError(() => {
          return of([]);
        })
      ).subscribe((result: SubventionRequestAid[]) => {
      this.requests = result
      return result.length ? this.goToResult() : this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
    });
  }

  onSearch(): void {
    this.search$.next(true);
  }

  reloadSearchResults() {
    // this.onSearch()
    this.searchByQueryString();
  }

  private clearSimpleSearch(): void {
    this.fm.getFormField('simpleSearch')?.reset();
    this.setInitialValues();
  }

  private clearAdvancedSearch(): void {
    this.fm.getFormField('advancedSearch')?.reset();
    this.setInitialValuesAdvanced();
  }

  clearSearch(): void {
    this.clearSimpleSearch();
    this.clearAdvancedSearch();
  }

  private goToResult(): void {
    this.skipQueryParamSearch = true;
    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {criteria: this.latestCriteriaString}
      }
    ).then((result) => {
      this.tabIndex$.next(1);
    });

  }

  private getSimpleSearchValues(): Partial<ISubventionRequestCriteria> {
    let request = {...this.fm.getFormField('simpleSearch.request')?.value};
    const year = this.fm.getFormField('simpleSearch.year')?.value;
    const date = dayjs().set('year', year);
    this.latestCriteria = {
      ...request,
      beneficiary: this.getBeneficiarySimpleValues(),
      creationDateFrom: date.startOf('year').format(this.configurationService.CONFIG.TIMESTAMP),
      creationDateTo: date.endOf('year').format(this.configurationService.CONFIG.TIMESTAMP),
    };
    return {...this.latestCriteria};
  }

  private getBeneficiarySimpleValues(): Partial<IBeneficiaryCriteria> {
    let beneficiary = {...this.fm.getFormField('simpleSearch.beneficiary')?.value};

    if (!beneficiary.benPrimaryIdNumber) {
      delete beneficiary.benPrimaryIdType;
    }

    if (!beneficiary.benSecIdNumber) {
      delete beneficiary.benSecIdType;
    }

    if (!beneficiary.arName.value) {
      delete beneficiary.arName;
    }

    if (!beneficiary.enName.value) {
      delete beneficiary.enName;
    }

    for (const key in beneficiary) {
      if (beneficiary.hasOwnProperty(key) && !beneficiary[key]) {
        delete beneficiary[key];
      }
    }
    return {...beneficiary};
  }

  private setInitialValues(): void {
    // set initial value for the year
    this.yearField.setValue(this.years[0]);
    this.primaryIdTypeField.setValue(this.configurationService.CONFIG.QID_LOOKUP_KEY);
    this.secondaryIdTypeField.setValue(null);
    this.arNameOperatorField.setValue(StringOperator[StringOperator.CONTAINS]);
    this.enNameOperatorField.setValue(StringOperator[StringOperator.CONTAINS]);
  }

  private setInitialValuesAdvanced(): void {

  }

  private getAdvancedSearchValues(): Partial<ISubventionRequestCriteria> {
    let simple = this.getSimpleSearchValues();
    let beneficiary = this.fm.getFormField('advancedSearch.beneficiary')?.value;
    let request = this.fm.getFormField('advancedSearch.request')?.value;
    this.latestCriteria = {
      ...simple,
      ...request,
      beneficiary: {...simple.beneficiary, ...beneficiary}
    };

    if (request.creationDateFrom || request.creationDateTo) {
      this.latestCriteria.creationDateFrom = !request.creationDateFrom ? '' : dayjs(changeDateFromDatepicker(request.creationDateFrom)).startOf('day').format(this.configurationService.CONFIG.TIMESTAMP);
      this.latestCriteria.creationDateTo = !request.creationDateTo ? '' : dayjs(changeDateFromDatepicker(request.creationDateTo)).endOf('day').format(this.configurationService.CONFIG.TIMESTAMP);
    } else {
      this.latestCriteria.creationDateFrom = simple.creationDateFrom;
      this.latestCriteria.creationDateTo = simple.creationDateTo;
    }

    if (request.statusDateModifiedFrom || request.statusDateModifiedTo) {
      this.latestCriteria.statusDateModifiedFrom = !request.statusDateModifiedFrom ? '' : dayjs(changeDateFromDatepicker(request.statusDateModifiedFrom)).startOf('day').format(this.configurationService.CONFIG.TIMESTAMP)
      this.latestCriteria.statusDateModifiedTo = !request.statusDateModifiedTo ? '' : dayjs(changeDateFromDatepicker(request.statusDateModifiedTo)).endOf('day').format(this.configurationService.CONFIG.TIMESTAMP)
    }

    return {...this.latestCriteria};
  }

  printResult(): void {
    let criteria = isEmptyObject(this.latestCriteria) ? this.latestCriteriaString : this.latestCriteria;
    this.subventionRequestService.loadByCriteriaAsBlob(criteria).subscribe((data) => {
      printBlobData(data, 'RequestByCriteriaSearchResult.pdf');
    });
  }

  printRequest($event: MouseEvent, request: SubventionRequestAid): void {
    $event.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequestAid): any {
    return this.router.navigate(['/home/main/request', request.requestId]);
  }

  cancelRequest(request: SubventionRequestAid) {
    request.cancel()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.request_cancelled_successfully) : null;
        this.reloadSearchResults();
      });
  }

  deleteRequest(request: SubventionRequestAid) {
    request.deleteRequest()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.msg_delete_success) : null;
        this.reloadSearchResults();
      });
  }

  showRequestDetails(request: SubventionRequestAid, $event: MouseEvent) {
    // start read mode request
    $event.preventDefault();
    this.readModeService.setReadOnly(request.requestId);
    this.router.navigate(['/home/main/request', request.requestId]).then();
  }

  setRelatedMinDate(fromFieldName: string, toFieldName: string, disableSelectedFromRelated: boolean = false): void {
    setTimeout(() => {
      let toFieldDateOptions: IAngularMyDpOptions = getDatePickerOptionsClone(this.datepickerOptionsMap[toFieldName]);
      const fromDate = changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[fromFieldName])?.value);
      if (!fromDate) {
        toFieldDateOptions.disableUntil = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(fromDate);
        disableDate.setHours(0, 0, 0, 0); // set fromDate to start of day
        if (!disableSelectedFromRelated) {
          disableDate.setDate(disableDate.getDate() - 1);
        }
        toFieldDateOptions.disableUntil = {
          year: disableDate.getFullYear(),
          month: disableDate.getMonth() + 1,
          day: disableDate.getDate()
        }
      }
      this.datepickerOptionsMap[toFieldName] = toFieldDateOptions;
    }, 100);
  }

  setRelatedMaxDate(fromFieldName: string, toFieldName: string, disableSelectedFromRelated: boolean = false): void {
    setTimeout(() => {
      let fromFieldDateOptions: IAngularMyDpOptions = getDatePickerOptionsClone(this.datepickerOptionsMap[fromFieldName]);
      const toDate = changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[toFieldName])?.value);
      if (!toDate) {
        fromFieldDateOptions.disableSince = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(toDate);
        if (!disableSelectedFromRelated) {
          disableDate.setDate(disableDate.getDate() + 1);
        }
        fromFieldDateOptions.disableSince = {
          year: disableDate.getFullYear(),
          month: disableDate.getMonth() + 1,
          day: disableDate.getDate()
        }
      }
      this.datepickerOptionsMap[fromFieldName] = fromFieldDateOptions;
    }, 100);
  }
}
