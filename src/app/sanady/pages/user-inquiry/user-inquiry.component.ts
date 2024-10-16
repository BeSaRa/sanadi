import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { FormManager } from '@app/models/form-manager';
import { LangService } from '@app/services/lang.service';
import { BeneficiaryService } from '@app/services/beneficiary.service';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { CustomValidators } from '@app/validators/custom-validators';
import { BeneficiaryIdTypes } from '@app/enums/beneficiary-id-types.enum';
import { IBeneficiaryCriteria } from '@app/interfaces/i-beneficiary-criteria';
import { StringOperator } from '@app/enums/string-operator.enum';
import { Beneficiary } from '@app/models/beneficiary';
import { DialogService } from '@app/services/dialog.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { SubventionRequestAid } from '@app/models/subvention-request-aid';
import { SubventionRequestAidService } from '@app/services/subvention-request-aid.service';
import { SubventionRequestService } from '@app/services/subvention-request.service';
import { isValidValue, printBlobData } from '@app/helpers/utils';
import { AdminResult } from '@app/models/admin-result';
import { ActivatedRoute } from '@angular/router';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { EmployeeService } from '@app/services/employee.service';
import { ECookieService } from '@app/services/e-cookie.service';
import { SortEvent } from '@app/interfaces/sort-event';
import { CommonUtils } from '@app/helpers/common-utils';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { GdxServicesEnum } from '@app/enums/gdx-services.enum';
import { TabMap } from '@app/types/types';
import { IGdxCriteria } from '@contracts/i-gdx-criteria';
import { GdxMophResponse } from '@app/models/gdx-moph-response';
import { PermissionsEnum } from '@enums/permissions-enum';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { IntegrationInquiriesComponent } from '@modules/gdx-integration/integration-inquiries/integration-inquiries.component';

@Component({
  selector: 'app-user-inquiry',
  templateUrl: './user-inquiry.component.html',
  styleUrls: ['./user-inquiry.component.scss'],
})
export class UserInquiryComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();
  private search$: Subject<any> = new Subject<any>();

  constructor(
    private fb: UntypedFormBuilder,
    public langService: LangService,
    private dialogService: DialogService,
    public lookupService: LookupService,
    private subventionRequestService: SubventionRequestService,
    private subventionRequestAidService: SubventionRequestAidService,
    private beneficiaryService: BeneficiaryService,
    private activeRoute: ActivatedRoute,
    private empService: EmployeeService,
    private eCookieService: ECookieService
  ) {
    this.searchByNamePermission = empService.checkPermissions(
      PermissionsEnum.SANADI_SEARCH_BENEFICIARY_BY_NAME
    );
    if (!this.searchByNamePermission) {
      this.displayIdCriteria = true;
    }
    this.prepareLookups();
  }

  form!: UntypedFormGroup;
  fm!: FormManager;
  stringOperators: Lookup[] = this.lookupService.getStringOperators();
  idTypes: Lookup[] = this.lookupService.listByCategory.BenIdType;
  idTypesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  nationalitiesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
  gulfCountries: Lookup[] = this.lookupService.listByCategory.GulfCountries;
  gulfCountriesLookup: Record<number, Lookup> = {} as Record<number, Lookup>;
  displayIdCriteria: boolean = false; // true = search by id, false = search by name
  beneficiary?: Beneficiary;
  requests: SubventionRequestAid[] = [];
  mophMortality?: GdxMophResponse;
  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId,
  };
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  identificationMap = {
    primary: 1,
    secondary: 2,
  };
  identifications: AdminResult[] = [
    AdminResult.createInstance({
      id: 1,
      arName: this.langService.getArabicLocalByKey('beneficiary_primary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_primary_id'),
      lookupKey: this.identificationMap.primary,
    }),
    AdminResult.createInstance({
      id: 2,
      arName: this.langService.getArabicLocalByKey('beneficiary_secondary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_secondary_id'),
      lookupKey: this.identificationMap.secondary,
    }),
  ];
  identificationsLookup: Record<number, AdminResult> = {} as Record<
    number,
    AdminResult
  >;
  nationalityVisible: boolean = false;
  nationalityListType: 'normal' | 'gulf' = 'normal';

  routeParams: IKeyValue = {};
  isNormalBenSearch: boolean = false;
  isBenSearchFromRequest: boolean = false;
  searchByNamePermission: boolean = false;

  filterControl: UntypedFormControl = new UntypedFormControl('');
  displayedColumns: string[] = [
    'requestFullSerial',
    'requestDate',
    'organization',
    'requestStatus',
    'requestedAidAmount',
    'totalApprovedAmount',
    'aidLookupParent',
    'actions',
  ];
  headerColumn: string[] = ['extra-header'];
  fileIconsEnum = FileIconsEnum;

  resultTabs: TabMap = {
    providedAids: {
      name: 'providedAids',
      index: 0,
      langKey: 'provided_aid',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
    integrationInquiries: {
      name: 'integrationInquiries',
      index: 1,
      langKey: 'integration_inquiries',
      validStatus: () => true,
      isTouchedOrDirty: () => true,
    },
  };

  @ViewChild(IntegrationInquiriesComponent)
  integrationInquiriesComponentRef!: IntegrationInquiriesComponent;

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

  sortingCallbacks = {
    requestDate: (
      a: SubventionRequestAid,
      b: SubventionRequestAid,
      dir: SortEvent
    ): number => {
      let value1 = !isValidValue(a) ? '' : new Date(a.creationDate).valueOf(),
        value2 = !isValidValue(b) ? '' : new Date(b.creationDate).valueOf();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (
      a: SubventionRequestAid,
      b: SubventionRequestAid,
      dir: SortEvent
    ): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestStatus: (
      a: SubventionRequestAid,
      b: SubventionRequestAid,
      dir: SortEvent
    ): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    aidLookupParent: (
      a: SubventionRequestAid,
      b: SubventionRequestAid,
      dir: SortEvent
    ): number => {
      let value1 = !CommonUtils.isValidValue(a)
          ? ''
          : a.aidLookupParentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b)
          ? ''
          : b.aidLookupParentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    totalApprovedAmount: (
      a: SubventionRequestAid,
      b: SubventionRequestAid,
      dir: SortEvent
    ): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidTotalPayedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidTotalPayedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  };

  actions: IMenuItem<SubventionRequestAid>[] = [
    // show aids
    {
      type: 'action',
      icon: ActionIconsEnum.AID_HELP,
      label: 'show_aids',
      displayInGrid: false,
      onClick: (item: SubventionRequestAid) => item.showAids(),
    },
    // print request form
    {
      type: 'action',
      icon: ActionIconsEnum.PRINT,
      label: 'print_request_form',
      onClick: (item: SubventionRequestAid) => this.printRequest(item),
    },
    // show logs
    {
      type: 'action',
      icon: ActionIconsEnum.LOGS,
      label: 'show_logs',
      onClick: (item: SubventionRequestAid) => item.showLogs(),
    },
  ];

  private prepareLookups(): void {
    this.idTypesLookup = this.idTypes.reduce((acc, item) => {
      return { ...acc, [item.lookupKey]: item };
    }, this.idTypesLookup);
    this.nationalitiesLookup = this.nationalities.reduce((acc, item) => {
      return { ...acc, [item.lookupKey]: item };
    }, this.nationalitiesLookup);
    this.gulfCountriesLookup = this.gulfCountries.reduce((acc, item) => {
      return { ...acc, [item.lookupKey]: item };
    }, this.gulfCountriesLookup);
    this.identificationsLookup = this.identifications.reduce((acc, item) => {
      return { ...acc, [item.lookupKey!]: item };
    }, this.identificationsLookup);
  }

  get currentForm(): UntypedFormGroup | null {
    return <UntypedFormGroup>(
      this.fm.getFormField(
        this.displayIdCriteria ? 'searchById' : 'searchByName'
      )
    );
  }

  private buildPageForm(): void {
    this.form = this.fb.group({
      inquiryType: [!this.searchByNamePermission, Validators.required],
      searchById: this.fb.group({
        identification: [1, [CustomValidators.required]],
        idType: [1, [CustomValidators.required]],
        nationality: [1],
        idNumber: [
          null,
          [CustomValidators.required].concat(this.idTypesValidationsMap[1]),
        ],
      }),
      searchByName: this.fb.group(
        {
          operator: [1],
          arName: [''],
          enName: [''],
        },
        {
          validators: CustomValidators.anyFieldsHasLength(['arName', 'enName']),
        }
      ),
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  private listenToCookies(): void {
    this.routeParams = this.eCookieService.getEObject(
      this.activeRoute.snapshot.data.cookieKey
    ) as IKeyValue;
    this.eCookieService.removeE(this.activeRoute.snapshot.data.cookieKey);

    const routeName = UserInquiryComponent._getRouteName(
      this.activeRoute
    ).toLowerCase();
    if (routeName === 'inquiries') {
      this.isNormalBenSearch = true;
      this.isBenSearchFromRequest = false;
    } else if (routeName === 'inquiry') {
      this.isNormalBenSearch = false;
      this.isBenSearchFromRequest = true;
      this.inquiryTypeField?.setValue(true); // set inquiry type to search by id
      this.identificationField?.setValue(this.identificationMap.primary); // set identification to primary
      this.idNumberField?.setValue(this.routeParams.idNumber); // set number
      this.idTypeField?.setValue(Number(this.routeParams.idType)); // set id type from request params
      this.search();
    }
  }

  private listenToInquiryTypeChange() {
    this.inquiryTypeField?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.displayIdCriteria = value;
      });
  }

  get inquiryTypeField(): UntypedFormControl {
    return this.fm.getFormField('inquiryType') as UntypedFormControl;
  }

  get identificationField(): UntypedFormControl {
    return this.fm.getFormField(
      'searchById.identification'
    ) as UntypedFormControl;
  }

  get idTypeField(): UntypedFormControl {
    return this.fm.getFormField('searchById.idType') as UntypedFormControl;
  }

  get idNumberField(): UntypedFormControl {
    return this.fm.getFormField('searchById.idNumber') as UntypedFormControl;
  }

  get nationalityField(): UntypedFormControl {
    return this.fm.getFormField('searchById.nationality') as UntypedFormControl;
  }

  private listenToIdTypeChange() {
    this.idTypeField?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        let nationalityValidators = null;
        if (
          value === BeneficiaryIdTypes.PASSPORT ||
          value === BeneficiaryIdTypes.GCC_ID
        ) {
          nationalityValidators = [CustomValidators.required];
        }

        this.idNumberField.setValidators(
          [CustomValidators.required].concat(this.idTypesValidationsMap[value])
        );
        this.idNumberField.updateValueAndValidity();

        this.nationalityVisible =
          value === BeneficiaryIdTypes.PASSPORT ||
          value === BeneficiaryIdTypes.GCC_ID;
        this.nationalityListType =
          value === BeneficiaryIdTypes.GCC_ID ? 'gulf' : 'normal';

        let nationality = null;
        if (
          this.isBenSearchFromRequest &&
          this.routeParams.hasOwnProperty('nationality') &&
          isValidValue(this.routeParams.nationality)
        ) {
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
      },
    };
  }

  private prepareSearchById(): Partial<IBeneficiaryCriteria> {
    let formValue = { ...this.currentForm?.value };

    let beneficiary = {} as Partial<IBeneficiaryCriteria>;
    if (formValue.identification === this.identificationMap.primary) {
      beneficiary.benPrimaryIdType = formValue.idType;
      beneficiary.benPrimaryIdNumber = formValue.idNumber;
      if (
        formValue.idType === BeneficiaryIdTypes.PASSPORT ||
        formValue.idType === BeneficiaryIdTypes.GCC_ID
      ) {
        beneficiary.benPrimaryIdNationality = formValue.nationality;
      }
    } else {
      beneficiary.benSecIdType = formValue.idType;
      beneficiary.benSecIdNumber = formValue.idNumber;
      if (
        formValue.idType === BeneficiaryIdTypes.PASSPORT ||
        formValue.idType === BeneficiaryIdTypes.GCC_ID
      ) {
        beneficiary.benSecIdNationality = formValue.nationality;
      }
    }
    return beneficiary;
  }

  private getCurrentFormValue(): Partial<IBeneficiaryCriteria> {
    return this.displayIdCriteria
      ? this.prepareSearchById()
      : this.prepareSearchByName();
  }

  private listenToSearch() {
    this.search$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.beneficiaryService
            .loadByCriteria(this.getCurrentFormValue())
            .pipe(catchError((_) => of([])));
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
      this.displayIdCriteria
        ? {
            idType: 1,
            identification: this.identificationMap.primary,
            nationality: 1,
          }
        : { operator: this.currentForm?.controls.operator.value }
    );

    this.requests = [];
    this.beneficiary = undefined;
  }

  private loadSubventionRequestAidByBeneficiaryId(id: number) {
    return this.subventionRequestAidService.loadByBeneficiaryId(id);
  }

  private _getGDXCriteria(
    beneficiary: Beneficiary,
    gdxServiceId: string
  ): IGdxCriteria {
    return {
      qId: this.getBeneficiaryQID(beneficiary),
      gdxServiceId: gdxServiceId,
      benId: beneficiary.id,
    };
  }

  private _loadDataForBeneficiary(
    beneficiary: Beneficiary | undefined,
    mortalityGdxCriteria: IGdxCriteria
  ) {
    if (!beneficiary) {
      return of({
        beneficiary: of(undefined),
        requests: of([]),
        mophMortality: of(undefined),
      });
    }
    return forkJoin({
      beneficiary: of(beneficiary),
      requests: this.loadSubventionRequestAidByBeneficiaryId(beneficiary.id),
      mophMortality:
        this.beneficiaryService.loadGDXMOPHMortality(mortalityGdxCriteria),
    });
  }

  private displaySelectBeneficiary(beneficiaries: Beneficiary[]): any {
    if (!beneficiaries.length) {
      this.dialogService
        .info(this.langService.map.no_result_for_your_search_criteria)
        .onAfterClose$.subscribe(() => {
          this.beneficiary = undefined;
          this.requests = [];
        });
    } else {
      let response: Observable<any>;
      if (beneficiaries.length === 1) {
        const gdxCriteria: IGdxCriteria = this._getGDXCriteria(
          beneficiaries[0],
          GdxServicesEnum.MOPH
        );
        response = this._loadDataForBeneficiary(beneficiaries[0], gdxCriteria);
      } else {
        response = this.beneficiaryService
          .openSelectBeneficiaryDialog(beneficiaries)
          .onAfterClose$.pipe(
            takeUntil(this.destroy$),
            mergeMap((value: Beneficiary & UserClickOn) => {
              if (value === UserClickOn.CLOSE) {
                return this._loadDataForBeneficiary(
                  beneficiaries[0],
                  {} as IGdxCriteria
                );
              }
              const gdxCriteria: IGdxCriteria = this._getGDXCriteria(
                value,
                GdxServicesEnum.MOPH
              );
              return this._loadDataForBeneficiary(value, gdxCriteria);
            })
          );
      }

      response.subscribe((result) => {
        this.beneficiary = result.beneficiary;
        this.requests = result.requests;
        this.mophMortality = result.mophMortality;
      });
    }
  }

  printResult(): void {
    this.subventionRequestService
      // @ts-ignore
      .loadByBeneficiaryIdAsBlob(this.beneficiary?.id)
      .subscribe((data) => {
        printBlobData(data, 'InquiryByCriteriaSearchResult.pdf');
      });
  }

  printRequest(request: SubventionRequestAid, $event?: MouseEvent): void {
    $event?.preventDefault();
    request.printRequest('InquiryByIdSearchResult.pdf');
  }

  private static _getRouteName(route: ActivatedRoute): string {
    let routeName = '';
    if (
      route &&
      route.hasOwnProperty('snapshot') &&
      route.snapshot.hasOwnProperty('data')
    ) {
      routeName = route.snapshot.data.routeName;
    }
    return routeName;
  }

  getBeneficiaryQID(beneficiary: Beneficiary): string {
    if (!beneficiary) {
      return '';
    }
    if (beneficiary.benPrimaryIdType === BeneficiaryIdTypes.QID) {
      return beneficiary.benPrimaryIdNumber;
    } else if (
      beneficiary.benSecIdNumber &&
      Number(beneficiary.benSecIdType) === BeneficiaryIdTypes.QID
    ) {
      return beneficiary.benSecIdNumber;
    } else {
      return '';
    }
  }

  onTabChange(tab: TabComponent): void {
    if (tab.name === this.resultTabs.integrationInquiries.name) {
      this._collapseIntegrationTabs();
    }
  }

  private _collapseIntegrationTabs(): void {
    if (!this.integrationInquiriesComponentRef) {
      return;
    }
    this.integrationInquiriesComponentRef.governmentTabsListRef?.collapseAll();
    this.integrationInquiriesComponentRef.charitableEntitiesTabsListRef?.collapseAll();
    this.integrationInquiriesComponentRef.mainTabIndex$.next(0);
  }
}
