import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {LangService} from '@app/services/lang.service';
import {SubventionRequestAid} from '@app/models/subvention-request-aid';
import {ConfigurationService} from '@app/services/configuration.service';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {StringOperator} from '@app/enums/string-operator.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {catchError, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ISubventionRequestCriteria} from '@app/interfaces/i-subvention-request-criteria';
import {IBeneficiaryCriteria} from '@app/interfaces/i-beneficiary-criteria';
import * as dayjs from 'dayjs';
import {DialogService} from '@app/services/dialog.service';
import {printBlobData} from '@app/helpers/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@app/services/toast.service';
import {EmployeeService} from '@app/services/employee.service';
import {BeneficiaryIdTypes} from '@app/enums/beneficiary-id-types.enum';
import {ReadModeService} from '@app/services/read-mode.service';
import {IMyInputFieldChanged} from '@nodro7/angular-mydatepicker';
import {AidTypes} from '@app/enums/aid-types.enum';
import {AidLookupStatusEnum} from '@app/enums/status.enum';
import {AidLookup} from '@app/models/aid-lookup';
import {AidLookupService} from '@app/services/aid-lookup.service';
import {ECookieService} from '@app/services/e-cookie.service';
import {DateUtils} from '@app/helpers/date-utils';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';

@Component({
  selector: 'app-user-request-search',
  templateUrl: './user-request-search.component.html',
  styleUrls: ['./user-request-search.component.scss']
})
export class UserRequestSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();


  constructor(public langService: LangService,
              private toastService: ToastService,
              private fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private configurationService: ConfigurationService,
              private dialogService: DialogService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private readModeService: ReadModeService,
              private subventionRequestService: SubventionRequestService,
              public empService: EmployeeService,
              private aidLookupService: AidLookupService,
              private eCookieService: ECookieService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadMainAidLookups();
    this.onIdTypeChange();

    this.listenToSearch();
    this.setInitialValues();
    this.setInitialValuesAdvanced();
    // this.listenToQueryParams();
    this.listenToReload();
  }

  ngAfterViewInit() {
    if (this.aidsRequestedAidCategoryField.value) {
      this.loadAidsSubAidLookups(this.aidsRequestedAidCategoryField.value);
    }
  }

  tabIndex$: Subject<number> = new Subject<number>();
  years: number[] = this.configurationService.getSearchYears();
  idTypes: Lookup[] = this.lookupService.listByCategory.BenIdType;
  stringOperators: Lookup[] = this.lookupService.getStringOperators();
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  requestsStatus: Lookup[] = this.lookupService.listByCategory.SubRequestStatus;
  employmentStatus: Lookup[] = this.lookupService.listByCategory.BenOccuptionStatus;
  form: UntypedFormGroup = {} as UntypedFormGroup;
  stringOperationMap: typeof StringOperator = StringOperator;
  private search$: Subject<any> = new Subject<any>();
  private latestCriteria: Partial<ISubventionRequestCriteria> = {} as Partial<ISubventionRequestCriteria>;
  private latestCriteriaString: string = '';
  private skipQueryParamSearch: boolean = true;
  requests: SubventionRequestAid[] = [];
  fileIconsEnum = FileIconsEnum;
  mainAidLookupsList: AidLookup[] = [];
  aidsSubAidLookupsList: AidLookup[] = [];

  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId
  };

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    creationDateFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    creationDateTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    statusDateFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    statusDateTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    statusDateModifiedFrom: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    statusDateModifiedTo: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterControl: UntypedFormControl = new UntypedFormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'organization', 'createdBy', 'requestStatus', 'estimatedAmount', 'requestedAidAmount', 'totalApprovedAmount', 'statusDateModified', 'actions'];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  sortingCallbacks = {
    requestDate: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.creationDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.creationDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    createdBy: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestStatus: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    estimatedAmount: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidSuggestedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidSuggestedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    totalApprovedAmount: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidTotalPayedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidTotalPayedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusDateModified: (a: SubventionRequestAid, b: SubventionRequestAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.statusDateModified!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.statusDateModified!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  actions: IMenuItem<SubventionRequestAid>[] = [
    // show aids
    {
      type: 'action',
      icon: ActionIconsEnum.AID_HELP,
      label: 'show_aids',
      displayInGrid: false,
      onClick: (item: SubventionRequestAid) => item.showAids()
    },
    // print request
    {
      type: 'action',
      icon: ActionIconsEnum.PRINT,
      label: 'print_request_form',
      onClick: (item: SubventionRequestAid) => this.printRequest(item)
    },
    // logs
    {
      type: 'action',
      icon: ActionIconsEnum.LOGS,
      label: 'show_logs',
      onClick: (item: SubventionRequestAid) => item.showLogs()
    },
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT_BOOK,
      label: 'btn_edit',
      onClick: (item: SubventionRequestAid) => this.editRequest(item),
      disabled: (item: SubventionRequestAid) => item.notUnderProcess(),
      show: () => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // cancel
    {
      type: 'action',
      icon: ActionIconsEnum.CANCEL_BOOK,
      label: 'btn_cancel',
      onClick: (item: SubventionRequestAid) => this.cancelRequest(item),
      disabled: (item: SubventionRequestAid) => item.notUnderProcess(),
      show: () => this.empService.checkPermissions('EDIT_SUBVENTION_REQUEST')
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE_TRASH,
      label: 'btn_delete',
      onClick: (item: SubventionRequestAid) => this.deleteRequest(item),
      show: (item: SubventionRequestAid) => !item.notUnderProcess()
    },
    // inquire beneficiary
    {
      type: 'action',
      icon: ActionIconsEnum.SEARCH_USER,
      label: 'inquire_beneficiary',
      onClick: (item: SubventionRequestAid) => this.inquireBeneficiary(item),
      show: (_item: SubventionRequestAid) => this.empService.checkPermissions('SUBVENTION_AID_SEARCH')
    },
  ];

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => {
      // this.searchByQueryString();
      this.search$.next(true);
    });
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: fromFieldName,
      toFieldName: toFieldName,
      controlsMap: this.datepickerControlsMap,
      controlOptionsMap: this.datepickerOptionsMap
    });
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
          requestFullSerial: [null, Validators.maxLength(50)]
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
        request: this.fb.group({
          status: [],
          creationDateFrom: [],
          creationDateTo: [],
          statusDateModifiedFrom: [],
          statusDateModifiedTo: []
        }),
        beneficiary: this.fb.group({
          phoneNumber1: [null, CustomValidators.commonValidations.phone],
          benNationality: [],
          occuptionStatus: []
        }),
        aids: this.fb.group({
          aidLookupParentId: [],
          aidLookupId: [],
        }),
      })
    });
    this._buildDatepickerControlsMap();
  }

  private _buildDatepickerControlsMap() {
    setTimeout(() => {
      this.datepickerControlsMap = {
        creationDateFrom: this.creationDateFromField,
        creationDateTo: this.creationDateToField,
        statusDateFrom: this.statusDateFromField,
        statusDateTo: this.statusDateToField,
        statusDateModifiedFrom: this.statusDateFromField,
        statusDateModifiedTo: this.statusDateToField,
      };
    })
  }

  private loadMainAidLookups() {
    this.mainAidLookupsList = [];
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.MAIN_CATEGORY,
      status: AidLookupStatusEnum.ACTIVE
    }).pipe(
      catchError(() => of([]))
    ).subscribe((list) => {
      this.mainAidLookupsList = list;
    });
  }

  handleAidsMainAidChange($event: number) {
    this.aidsRequestedAidField.reset();
    this.loadAidsSubAidLookups($event);
  }

  private loadAidsSubAidLookups(mainAidId: number) {
    this.aidsSubAidLookupsList = [];
    if (!mainAidId) {
      return;
    }
    this.aidLookupService.loadByCriteria({
      aidType: AidTypes.SUB_CATEGORY,
      status: AidLookupStatusEnum.ACTIVE,
      parent: mainAidId
    }).pipe(
      catchError(() => of([]))
    ).subscribe(list => {
      this.aidsSubAidLookupsList = list;
    });
  }

  get arNameOperatorField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.arName.operator')! as UntypedFormControl;
  }

  get enNameOperatorField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.enName.operator') as UntypedFormControl;
  }

  get primaryIdTypeField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.benPrimaryIdType') as UntypedFormControl;
  }

  get secondaryIdTypeField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.benSecIdType') as UntypedFormControl;
  }

  get yearField(): UntypedFormControl {
    return this.form.get('simpleSearch.year')! as UntypedFormControl;
  }

  get aidsRequestedAidCategoryField(): UntypedFormControl {
    return this.form.get('advancedSearch.aids.aidLookupParentId') as UntypedFormControl;
  }

  get aidsRequestedAidField(): UntypedFormControl {
    return this.form.get('advancedSearch.aids.aidLookupId') as UntypedFormControl;
  }

  get creationDateFromField(): UntypedFormControl {
    return this.form.get('advancedSearch.request.creationDateFrom') as UntypedFormControl;
  }

  get creationDateToField(): UntypedFormControl {
    return this.form.get('advancedSearch.request.creationDateTo') as UntypedFormControl;
  }

  get statusDateFromField(): UntypedFormControl {
    return this.form.get('advancedSearch.request.statusDateModifiedFrom') as UntypedFormControl;
  }

  get statusDateToField(): UntypedFormControl {
    return this.form.get('advancedSearch.request.statusDateModifiedTo') as UntypedFormControl;
  }

  get primaryIdNumberField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.benPrimaryIdNumber') as UntypedFormControl;
  }

  get secondaryIdNumberField(): UntypedFormControl {
    return this.form.get('simpleSearch.beneficiary.benSecIdNumber') as UntypedFormControl;
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
    this.search$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return this.getAdvancedSearchValues();
      }),
      switchMap((criteria) => {
        return this.subventionRequestService.loadByCriteria(criteria)
          .pipe(
            takeUntil(this.destroy$),
            catchError(() => {
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

  private searchByQueryString(): any {
    /*this.skipQueryParamSearch = true;
    return this.subventionRequestService.loadByCriteria(this.latestCriteriaString)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      ).subscribe((result: SubventionRequestAid[]) => {
        this.requests = result
        return result.length ? this.goToResult() : this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
      });*/
  }

  onSearch(): void {
    this.search$.next(true);
  }

  private clearSimpleSearch(): void {
    this.form.get('simpleSearch')?.reset();
    this.setInitialValues();
  }

  private clearAdvancedSearch(): void {
    this.form.get('advancedSearch')?.reset();
    this.setInitialValuesAdvanced();
  }

  clearSearch(): void {
    this.clearSimpleSearch();
    this.clearAdvancedSearch();
  }

  private goToResult(): void {
    /*this.skipQueryParamSearch = true;
    this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {criteria: this.latestCriteriaString}
      }
    ).then((_) => {
      this.tabIndex$.next(1);
    });*/
    this.tabIndex$.next(1);
  }

  private getSimpleSearchValues(): Partial<ISubventionRequestCriteria> {
    let request = {...this.form.get('simpleSearch.request')?.value};
    const year = this.yearField?.value;
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
    let beneficiary = {...this.form.get('simpleSearch.beneficiary')?.value};

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
    this.yearField.setValue(this.years[0]);
    this.primaryIdTypeField.setValue(BeneficiaryIdTypes.QID)
    this.secondaryIdTypeField.setValue(null);
    this.arNameOperatorField.setValue(StringOperator[StringOperator.CONTAINS]);
    this.enNameOperatorField.setValue(StringOperator[StringOperator.CONTAINS]);
  }

  private setInitialValuesAdvanced(): void {

  }

  private getAdvancedSearchValues(): Partial<ISubventionRequestCriteria> {
    let simple = this.getSimpleSearchValues();
    let beneficiary = this.form.get('advancedSearch.beneficiary')?.value;
    let request = this.form.get('advancedSearch.request')?.value;
    let aids = this.form.get('advancedSearch.aids')?.value;
    this.latestCriteria = {
      ...simple,
      ...request,
      ...aids,
      beneficiary: {...simple.beneficiary, ...beneficiary},
    };

    if (request.creationDateFrom || request.creationDateTo) {
      /*this.latestCriteria.creationDateFrom = !request.creationDateFrom ? '' : dayjs(DateUtils.changeDateFromDatepicker(request.creationDateFrom)).startOf('day').format(this.configurationService.CONFIG.TIMESTAMP);
      this.latestCriteria.creationDateTo = !request.creationDateTo ? '' : dayjs(DateUtils.changeDateFromDatepicker(request.creationDateTo)).endOf('day').format(this.configurationService.CONFIG.TIMESTAMP);*/

      this.latestCriteria.creationDateFrom = !request.creationDateFrom ? '' : request.creationDateFrom;
      this.latestCriteria.creationDateTo = !request.creationDateTo ? '' : request.creationDateTo;
    } else {
      this.latestCriteria.creationDateFrom = simple.creationDateFrom;
      this.latestCriteria.creationDateTo = simple.creationDateTo;
    }

    if (request.statusDateModifiedFrom || request.statusDateModifiedTo) {
      /*this.latestCriteria.statusDateModifiedFrom = !request.statusDateModifiedFrom ? '' : dayjs(DateUtils.changeDateFromDatepicker(request.statusDateModifiedFrom)).startOf('day').format(this.configurationService.CONFIG.TIMESTAMP)
      this.latestCriteria.statusDateModifiedTo = !request.statusDateModifiedTo ? '' : dayjs(DateUtils.changeDateFromDatepicker(request.statusDateModifiedTo)).endOf('day').format(this.configurationService.CONFIG.TIMESTAMP)*/

      this.latestCriteria.statusDateModifiedFrom = !request.statusDateModifiedFrom ? '' : request.statusDateModifiedFrom;
      this.latestCriteria.statusDateModifiedTo = !request.statusDateModifiedTo ? '' : request.statusDateModifiedTo;
    }

    return {...this.latestCriteria};
  }

  printResult(): void {
    // let criteria = isEmptyObject(this.latestCriteria) ? this.latestCriteriaString : this.latestCriteria;
    this.subventionRequestService.loadByCriteriaAsBlob(this.latestCriteria).subscribe((data) => {
      printBlobData(data, 'RequestByCriteriaSearchResult.pdf');
    });
  }

  printRequest(request: SubventionRequestAid, $event?: MouseEvent): void {
    $event?.preventDefault();
    request.printRequest('RequestByIdSearchResult.pdf');
  }

  editRequest(request: SubventionRequestAid): any {
    return this.router.navigate(['/home/sanady/request', request.requestId]);
  }

  cancelRequest(request: SubventionRequestAid) {
    request.cancel()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.request_cancelled_successfully) : null;
        this.reload$.next(null);
      });
  }

  deleteRequest(request: SubventionRequestAid) {
    request.deleteRequest()
      .pipe(take(1))
      .subscribe((status) => {
        status ? this.toastService.success(this.langService.map.msg_delete_success) : null;
        this.reload$.next(null);
      });
  }

  inquireBeneficiary(request: SubventionRequestAid) {
    this.eCookieService.putEObject('b_i_d', {
      idType: request.benPrimaryIdType,
      idNumber: request.benPrimaryIdNumber,
      nationality: request.benPrimaryIdNationality
    });
    this.router.navigate(['/home/sanady/inquiry']).then();
  }

  showRequestDetails(request: SubventionRequestAid, $event: MouseEvent) {
    // start read mode request
    $event.preventDefault();
    this.readModeService.setReadOnly(request.requestId);
    this.router.navigate(['/home/sanady/request', request.requestId]).then();
  }
}
