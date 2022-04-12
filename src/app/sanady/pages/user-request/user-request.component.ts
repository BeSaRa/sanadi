import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {BehaviorSubject, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  pairwise,
  pluck,
  share,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {BeneficiaryService} from '@app/services/beneficiary.service';
import {Beneficiary} from '@app/models/beneficiary';
import {ConfigurationService} from '@app/services/configuration.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {ToastService} from '@app/services/toast.service';
import {SubventionRequest} from '@app/models/subvention-request';
import {SubventionRequestService} from '@app/services/subvention-request.service';
import {SubventionAid} from '@app/models/subvention-aid';
import {AidLookupService} from '@app/services/aid-lookup.service';
import {AidLookup} from '@app/models/aid-lookup';
import {Lookup} from '@app/models/lookup';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {SubventionAidService} from '@app/services/subvention-aid.service';
import {StatusEnum} from '@app/enums/status.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {PeriodicPayment, SubAidPeriodicTypeEnum} from '@app/enums/periodic-payment.enum';
import {SubventionRequestStatus} from '@app/enums/subvention-request-status';
import {Pair} from '@app/interfaces/pair';
import {BeneficiarySaveStatus} from '@app/enums/beneficiary-save-status.enum';
import {formatDate} from '@angular/common';
import {ReadModeService} from '@app/services/read-mode.service';
import {
  CanNavigateOptions,
  DatepickerControlsMap,
  DatepickerOptionsMap,
  ReadinessStatus,
  TabMap
} from '@app/types/types';
import {NavigationService} from '@app/services/navigation.service';
import {BeneficiaryIdTypes} from '@app/enums/beneficiary-id-types.enum';
import {SubventionResponseService} from '@app/services/subvention-response.service';
import {SubventionResponse} from '@app/models/subvention-response';
import {SanadiAttachment} from '@app/models/sanadi-attachment';
import {AttachmentService} from '@app/services/attachment.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {AidTypes} from '@app/enums/aid-types.enum';
import {ECookieService} from '@app/services/e-cookie.service';
import {DateUtils} from '@app/helpers/date-utils';
import {EmployeeService} from '@app/services/employee.service';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {AdminResult} from '@app/models/admin-result';
import {BuildingPlateComponent} from '@app/shared/components/building-plate/building-plate.component';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  BeneficiaryObligationComponent
} from '@app/sanady/shared/beneficiary-obligation/beneficiary-obligation.component';
import {BeneficiaryIncomeComponent} from '@app/sanady/shared/beneficiary-income/beneficiary-income.component';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {AttachmentListComponent} from '@app/shared/components/attachment-list/attachment-list.component';
import {AttachmentTypeEnum} from '@app/enums/attachment-type.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(public langService: LangService,
              public lookup: LookupService,
              private beneficiaryService: BeneficiaryService,
              private dialogService: DialogService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private subventionRequestService: SubventionRequestService,
              private subventionResponseService: SubventionResponseService,
              private subventionAidService: SubventionAidService,
              private aidLookupService: AidLookupService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private cd: ChangeDetectorRef,
              private navigationService: NavigationService,
              private readModeService: ReadModeService,
              private attachmentService: AttachmentService, // to use in interceptor
              private fb: FormBuilder,
              private empService: EmployeeService,
              private exceptionHandlerService: ExceptionHandlerService,
              private eCookieService: ECookieService) {

  }

  get pageTitle(): string {
    return this.currentRequest?.id ?
      (this.langService.map.request_number + ' : ' + this.currentRequest.requestFullSerial) :
      this.langService.map.menu_provide_request;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToRequestDateChange();
    this.listenToBeneficiaryChange();
    this.listenToRequestChange();
    this.listenToOccupationStatus();
    this.listenToAidChange();
    this.listenToExtraIncome();
    this.listenToSaveModel();
    this.listenToSavePartialRequest();
    this.listenToSaveAid();
    this.listenToAddAid();
    this.listenToNationalityChange();
    this.listenToPrimaryIdTypeChange();
    this.listenToSecondaryIdTypeChange();
    this.preparePeriodicityLookups();
    this.listenToRouteParams();
    this.loadMainAidLookups();

  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    // empty read mode request
    if (this.currentRequest?.id) {
      this.readModeService.deleteReadOnly(this.currentRequest.id);
    }
  }

  private destroy$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();
  private savePartial$: Subject<any> = new Subject<any>();
  private saveAid$: Subject<any> = new Subject<any>();
  private idMap: { [index: string]: number } = {
    qid: 1,
    gccId: 2,
    visa: 4,
    passport: 3,
  };
  private beneficiaryChanged$: Subject<Beneficiary | null> = new Subject<Beneficiary | null>();
  private requestChanged$: Subject<SubventionRequest | null> = new Subject<SubventionRequest | null>();
  private aidChanged$: Subject<SubventionAid | null> = new Subject<SubventionAid | null>();
  public currentBeneficiary?: Beneficiary;
  private currentAid?: SubventionAid;
  addAid$: Subject<any> = new Subject<any>();
  currentRequest?: SubventionRequest;
  subventionAidList: SubventionAid[] = [];
  subventionAidDataSource: BehaviorSubject<SubventionAid[]> = new BehaviorSubject<SubventionAid[]>([]);
  attachmentList: SanadiAttachment[] = [];
  fm!: FormManager;
  form!: FormGroup;
  mainAidLookupsList: AidLookup[] = [];
  subAidLookupsList: AidLookup[] = [];

  aidsSubAidLookupsList: AidLookup[] = [];
  periodicityLookups: Record<number, Lookup> = {};
  editAidItem?: SubventionAid;
  editMode = false;
  headerColumn: string[] = ['extra-header'];
  aidFilterControl: FormControl = new FormControl('');
  aidsActions: IMenuItem<SubventionAid>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: SubventionAid) => this.editAid(item),
      disabled: (item: SubventionAid) => {
        return this.readOnly || (this.isPartialRequest && !!this.currentRequest && !this.currentRequest.isUnderProcessing());
      }
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: SubventionAid) => this.deleteAid(item),
      show: (item: SubventionAid) => {
        return !this.readOnly && !this.isPartialRequest;
      }
    }
  ];

  aidColumns = [
    'approvalDate',
    'requestedAidCategory',
    'requestedAid',
    'estimatedAmount',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'givenAmount',
    'remainingAmount',
    'actions'
  ];
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    dateOfBirth: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    creationDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    statusDateModified: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    aidApprovalDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    aidPaymentDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  actionIconsEnum = ActionIconsEnum;
  fileExtensionsEnum = FileExtensionsEnum;

  aidApprovalDateSub!: Subscription;
  readOnly = false;
  isPartialRequest: boolean = false;
  private requestStatusArray: SubventionRequestStatus[] = [SubventionRequestStatus.REJECTED, SubventionRequestStatus.SAVED];
  private validateStatus: boolean = true;

  idTypes: Lookup[] = this.lookup.listByCategory.BenIdType;
  displayPrimaryNationality: boolean = false;
  displaySecondaryNationality: boolean = false;
  primaryNationalityListType: 'normal' | 'gulf' = 'normal';
  secondaryNationalityListType: 'normal' | 'gulf' = 'normal';

  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId,
  };


  @ViewChild('attachmentListComponent') attachmentListComponent!: AttachmentListComponent;
  @ViewChild('buildingPlate') buildingPlate!: BuildingPlateComponent;
  @ViewChild('beneficiaryObligations') beneficiaryObligationComponentRef!: BeneficiaryObligationComponent;
  @ViewChild('beneficiaryIncomes') beneficiaryIncomeComponentRef!: BeneficiaryIncomeComponent;
  beneficiaryObligationsStatus: ReadinessStatus = 'READY';
  beneficiaryIncomesStatus: ReadinessStatus = 'READY';

  tabsData: TabMap = {
    personal: {
      name: 'personalTab',
      langKey: 'personal_info',
      index: 0,
      checkTouchedDirty: true,
      validStatus: () => this.personalInfoTab && this.personalInfoTab.valid,
      isTouchedOrDirty: () => this.personalInfoTab && (this.personalInfoTab.touched || this.personalInfoTab.dirty)
    },
    income: {
      name: 'incomeTab',
      langKey: 'income_employment',
      index: 1,
      checkTouchedDirty: false,
      validStatus: () => {
        return this.incomeTab && this.incomeTab.valid
          && (!this.beneficiaryObligationComponentRef || (this.beneficiaryObligationsStatus === 'READY' && this.beneficiaryObligationComponentRef.list.length > 0))
          && (!this.beneficiaryIncomeComponentRef || (this.beneficiaryIncomesStatus === 'READY' && this.beneficiaryIncomeComponentRef.list.length > 0));
      },
      isTouchedOrDirty: () => {
        return (this.incomeTab && (this.incomeTab.touched || this.incomeTab.dirty))
          || (this.beneficiaryObligationComponentRef && this.beneficiaryObligationComponentRef.isTouchedOrDirty())
          || (this.beneficiaryIncomeComponentRef && this.beneficiaryIncomeComponentRef.isTouchedOrDirty())
      }
    },
    address: {
      name: 'addressTab',
      langKey: 'lbl_address',
      index: 2,
      checkTouchedDirty: true,
      validStatus: () => this.addressTab && this.addressTab.valid && !!this.buildingPlate && this.buildingPlate.isValidForm(),
      isTouchedOrDirty: () => (this.addressTab && (this.addressTab.touched || this.addressTab.dirty)) || (this.buildingPlate && this.buildingPlate.isTouchedOrDirty())
    },
    requestInfo: {
      name: 'requestInfoTab',
      langKey: 'request_info',
      index: 3,
      checkTouchedDirty: true,
      validStatus: () => this.requestInfoTab && this.requestInfoTab.valid,
      isTouchedOrDirty: () => this.requestInfoTab && (this.requestInfoTab.touched || this.requestInfoTab.dirty)
    },
    requestStatus: {
      name: 'requestStatusTab',
      langKey: 'request_status',
      index: 4,
      checkTouchedDirty: true,
      validStatus: () => this.requestStatusTab && this.requestStatusTab.valid,
      isTouchedOrDirty: () => this.requestStatusTab && (this.requestStatusTab.touched || this.requestStatusTab.dirty)
    },
    aids: {
      name: 'aidsTab',
      langKey: 'provided_aid',
      index: 5,
      checkTouchedDirty: true,
      validStatus: () => this.aidFormArray && this.aidFormArray.valid,
      isTouchedOrDirty: () => this.aidFormArray && (this.aidFormArray.touched || this.aidFormArray.dirty)
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 6,
      checkTouchedDirty: true,
      validStatus: () => this.attachmentsTab && this.attachmentsTab.valid,
      isTouchedOrDirty: () => this.attachmentsTab && (this.attachmentsTab.touched || this.attachmentsTab.dirty)
    }
  };

  saveVisible: boolean = true;
  cancelVisible: boolean = true;
  validateFieldsVisible: boolean = true;

  routeParamTypes = {
    normal: 'normal',
    partial: 'partial'
  };
  currentParamType: string = this.routeParamTypes.normal;
  isAttachmentFormVisible: boolean = false;
  skipConfirmUnsavedChanges: boolean = false;

  saveActions = {
    validateAndSave: 'validateAndSave',
    skipValidateAndSave: 'skipValidateAndSave',
    saveAndInquire: 'saveAndInquire',
    partialSave: 'partialSave'
  };
  ndaFile: any;
  ndaAttachment: any;

  @ViewChild('aidsTable') aidsTable!: TableComponent;

  aidsSortingCallbacks = {
    approvalDate: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.approvalDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.approvalDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestedAidCategory: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupParentInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupParentInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestedAid: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    estimatedAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidSuggestedAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidSuggestedAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    periodicity: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.periodicTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.periodicTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    paymentDate: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.aidStartPayDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.aidStartPayDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    givenAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    remainingAmount: (a: SubventionAid, b: SubventionAid, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidRemainingAmount,
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidRemainingAmount;
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  private buildForm(beneficiary ?: Beneficiary, request?: SubventionRequest) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    request = request ? request : new SubventionRequest();
    this.form = this.fb.group({
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      incomeTab: this.fb.group(beneficiary.getIncomeFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group(request.getInfoFields(true)),
      disableDataSharing: this.fb.control(beneficiary.disableDataSharing),
      requestStatusTab: this.editMode ? this.buildRequestStatusTab(request) : null,
      aidTab: this.fb.array([])
    });
    this.fm = new FormManager(this.form, this.langService);
    this._buildDatepickerControlsMap();
  }

  private buildRequestStatusTab(request?: SubventionRequest): FormGroup {
    request = request ? request : new SubventionRequest();
    const group = this.fb.group(request.getStatusFields(true)) as FormGroup;
    this.listenToRequestStatusChange(group);
    this._buildDatepickerControlsMap();
    return group;
  }

  private _buildDatepickerControlsMap() {
    setTimeout(() => {
      this.datepickerControlsMap = {
        dateOfBirth: this.dateOfBirthField,
        creationDate: this.creationDateField,
        requestDate: this.requestDateField,
        statusDateModified: this.statusDateModifiedField,
        aidApprovalDate: this.aidApprovalDate,
        aidPaymentDate: this.aidPaymentDate
      };
    })
  }

  private listenToBeneficiaryChange() {
    this.beneficiaryChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((beneficiary) => {
        if (beneficiary instanceof Beneficiary) {
          this.currentBeneficiary = beneficiary;
        } else {
          this.currentBeneficiary = undefined;
        }
        this.updateBeneficiaryFrom(this.currentBeneficiary);
      });
  }

  private updateBeneficiaryFrom(selectedBeneficiary: undefined | Beneficiary) {
    const personal = this.fm.getFormField('personalTab');
    const income = this.fm.getFormField('incomeTab');
    const address = this.fm.getFormField('addressTab');

    if (!selectedBeneficiary) {
      personal?.reset();
      personal?.markAsPristine();
      income?.reset();
      income?.markAsPristine();
      this.disableDataSharingField.setValue(false);
      this.beneficiaryIncomeComponentRef.forceClearComponent();
      this.beneficiaryObligationComponentRef.forceClearComponent();
      address?.reset();
      address?.markAsPristine();
    } else {
      personal?.patchValue(selectedBeneficiary.getPersonalFields());
      income?.patchValue(selectedBeneficiary.getIncomeFields());
      address?.patchValue(selectedBeneficiary.getAddressFields());
      this.disableDataSharingField.setValue(selectedBeneficiary.disableDataSharing);
    }

  }

  private updateRequestForm(request: undefined | SubventionRequest) {
    const requestInfo = this.fm.getFormField('requestInfoTab');
    const requestStatus = this.fm.getFormField('requestStatusTab');
    if (!request) {
      requestInfo?.reset();
      requestStatus?.reset();
      this.readOnly = false;
      this.subAidLookupsList = [];
    } else {
      requestStatus?.patchValue(request.getStatusFields());
      requestInfo?.patchValue(request.getInfoFields());

      this.loadSubAidLookups(request.aidLookupParentId);

      if (request.isPartial) {
        this.displayFormValidity();
      } else {
        if (request.id) {
          this.readOnly = this.readModeService.isReadOnly(request.id);
          this.disableDataSharingField?.disable();
          if (this.readOnly) {
            this.allowCompletionField?.disable();
          }
          this.displayFormValidity();
        } else {
          this.readOnly = false;
        }
      }
    }
  }

  // noinspection JSUnusedLocalSymbols
  private updateSecondaryIdNumber(field: { field: string, value: string }): void {
    this.fm.getFormField('personalTab.benSecIdNumber')?.setValue(field.value);
    this.fm.getFormField('personalTab.benSecIdType')?.setValue(field.value.length ? this.idMap[field.field] : null);
  }

  private listenToOccupationStatus() {
    const requiredList: { [key: string]: any } = {
      occuption: [CustomValidators.required, CustomValidators.pattern('ENG_AR_ONLY'), CustomValidators.maxLength(100)],
      employeerAddress: [CustomValidators.required, CustomValidators.maxLength(512)],
      benIncome: [CustomValidators.required, CustomValidators.maxLength(20), CustomValidators.number, Validators.min(0)]
    };
    this.fm.getFormField('incomeTab.occuptionStatus')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        map(value => {
          return value !== this.configurationService.CONFIG.UNEMPLOYED_LOOKUP_KEY;
        }),
        distinctUntilChanged()
      )
      .subscribe((required) => {
        const keys = Object.keys(requiredList);
        for (let i = 0; i < keys.length; i++) {
          const control = this.fm.getFormField(`incomeTab.${keys[i]}`);
          control?.setValidators(required ? requiredList[keys[i]] : null);
          control?.updateValueAndValidity();
        }
      });
  }

  private listenToNationalityChange() {
    this.fm.getFormField('personalTab.benNationality')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      const control = this.fm.getFormField('personalTab.employeer');
      // 1 is Qatari
      if (value !== 1) {
        control?.setValidators([CustomValidators.required, CustomValidators.pattern('ENG_AR_ONLY')]);
      } else {
        control?.setValidators([CustomValidators.pattern('ENG_AR_ONLY')]);
      }
      control?.updateValueAndValidity();
    });


    this.primaryNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((_) => {
      if (this.primaryIdTypeField?.value === this.idMap.passport && CommonUtils.isValidValue(this.primaryNationalityField?.value)) {
        this.benNationalityField?.setValue(this.primaryNationalityField?.value);
        this.benNationalityField?.updateValueAndValidity();
      }
    });

    this.secondaryNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((_) => {
      if (this.secondaryIdTypeField?.value === this.idMap.passport && CommonUtils.isValidValue(this.secondaryNationalityField?.value)) {
        this.benNationalityField?.setValue(this.secondaryNationalityField?.value);
        this.benNationalityField?.updateValueAndValidity();
      }
    });
  }

  private listenToExtraIncome() {
    this.fm.getFormField('incomeTab.benExtraIncome')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      const control = this.fm.getFormField('incomeTab.benExtraIncomeSource');
      value ? control?.setValidators([CustomValidators.required, Validators.maxLength(100)])
        : control?.setValidators([Validators.maxLength(100)]);
      control?.updateValueAndValidity();
    });
  }

  private listenToSavePartialRequest() {
    const formStatusPartial$ = this.savePartial$.pipe(
      tap(val => console.log(val)),
      map(() => {
        return this.fm.getForm()?.valid && this.buildingPlate.isValidForm();
      })
    );

    // filter invalidForm stream
    const invalidFormPartial$ = formStatusPartial$.pipe(
      filter(value => {
        return value === false;
      })
    );

    // filter valid form stream
    const validFormPartial$ = formStatusPartial$.pipe(
      filter(value => {
        return value === true;
      })
    );

    // prepare the beneficiary/request Models.
    const requestWithBeneficiaryPartial$ = validFormPartial$.pipe(
      map(() => {
        return {
          beneficiary: this.prepareBeneficiary(),
          request: this.prepareRequest(),
        };
      })
    );

    requestWithBeneficiaryPartial$
      .pipe(
        switchMap((value) => {
          let data: SubventionResponse = new SubventionResponse().clone({
            request: value.request,
            beneficiary: value.beneficiary,
            aidList: this.subventionAidList,
            attachmentList: this.attachmentList
          });
          return this.subventionResponseService.savePartialRequest(data)
            .pipe(catchError((err) => {
              // this.exceptionHandlerService.handle(err);
              return of(null);
            }));
        })
      ).subscribe((response) => {
      if (!response) {
        return;
      }

      this.dialogService.success(this.langService.map.msg_request_has_been_added_successfully.change({serial: response.request.requestFullSerial}));
      this.currentParamType = 'normal';
      this.form.markAsPristine({onlySelf: true});
      this.skipConfirmUnsavedChanges = true;
      this.router.navigate(['/home/sanady/request/', response.request.id]).then();
    });

    // if we have invalid forms display dialog to tell the user that is something wrong happened.
    invalidFormPartial$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkFormFieldsCallback();
      });
  }

  private listenToSaveModel() {
    let saveType: string = '';
    const formAidValid$ = this.save$
      .pipe(
        tap(val => {
          saveType = val;
        }),
        tap(_ => !this.validRequestStatus() ? this.displayRequestStatusMessage() : null),
        filter(_ => this.validRequestStatus()),
        share()
      );


    // map formStatus
    const formStatus$ = formAidValid$.pipe(
      map(() => {
        let isValid = this.fm.getForm()?.valid && this.buildingPlate.isValidForm();
        if (!!this.currentRequest && this.currentRequest.id) {
          return isValid;
        }
        return isValid && (!this.disableDataSharingField.value ? true : !!this.ndaFile);
      })
    );


    // filter invalidForm stream
    const invalidForm$ = formStatus$.pipe(
      filter(value => {
        return value === false;
      })
    );
    // filter valid form stream
    const validForm$ = formStatus$.pipe(
      filter(value => {
        return value === true;
      })
    );


    // prepare the beneficiary/request Models.
    const requestWithBeneficiary$ = validForm$.pipe(
      map(() => {
        return {
          beneficiary: this.prepareBeneficiary(),
          request: this.prepareRequest(),
        };
      })
    );

    const saveBeneficiary$ = requestWithBeneficiary$
      .pipe(
        map(value => value.beneficiary),
        exhaustMap(beneficiary => {
          return beneficiary.saveWithValidate(this.validateStatus, this.currentRequest).pipe(catchError(() => {
            return of(null);
          }));
        }),
        filter((value) => this.validateBeneficiaryResponse(value) !== 'STOP'),
        tap((value) => this.displayBeneficiaryExistsMessage(value)),
        map(value => {
          return value?.second;
        }),
        filter(value => !!value),
        tap(beneficiary => this.currentBeneficiary = beneficiary)
      );

    saveBeneficiary$
      .pipe(
        withLatestFrom(requestWithBeneficiary$),
        map((value) => {
          value[1].request.benId = value[0]?.id as number;
          return value[1].request;
        }),
        exhaustMap((request: SubventionRequest) => {
          return request.save().pipe(catchError((err) => {
            // this.exceptionHandlerService.handle(err);
            return of(null);
          }));
        })
      ).subscribe((request) => {
      if (!request) {
        return;
      }

      this.uploadNDADocument(request)
        .subscribe((ndaStatus) => {
          if (ndaStatus === 'FAILED_NDA_ATTACHMENT') {
            this.dialogService.info(this.langService.map.msg_save_fail_x.change({x: this.langService.map.nda_document}));
          } else if (ndaStatus !== 'NO_NDA_NEEDED') {
            this.ndaAttachment.vsId = ndaStatus;
            this.attachmentList.push(this.ndaAttachment);
          }

          if (this.editMode) {
            this.dialogService.success(this.langService.map.msg_request_has_been_updated_successfully);
          } else {
            this.dialogService.success(this.langService.map.msg_request_has_been_added_successfully.change({serial: request.requestFullSerial}));
          }
          this.currentRequest = request.clone();
          this.editMode = true;

          this.disableDataSharingField?.disable();

          if (!this.currentRequest.isUnderProcessing()) {
            this.allowCompletionField?.disable();
            this.readModeService.setReadOnly(this.currentRequest.id);
          }

          if (!this.requestStatusTab.value) {
            this.form.setControl('requestStatusTab', this.buildRequestStatusTab(this.currentRequest));
          }
          this.form.markAsPristine({onlySelf: true});

          this.ndaAttachment = undefined;

          if (saveType === this.saveActions.validateAndSave) {
            this.requestChanged$.next(this.currentRequest);
          } else if (saveType === this.saveActions.saveAndInquire) {
            this.skipConfirmUnsavedChanges = true;
            const ben = this.prepareBeneficiary();
            this.eCookieService.putEObject('b_i_d', {
              idType: ben.benPrimaryIdType,
              idNumber: ben.benPrimaryIdNumber,
              nationality: ben.benPrimaryIdNationality
            });
            this.router.navigate(['/home/sanady/inquiry']).then();
          }
        });

    });

    // if we have invalid forms display dialog to tell the user that is something wrong happened.
    invalidForm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkFormFieldsCallback();
      });
  }

  private uploadNDADocument(request: SubventionRequest): Observable<any> {
    // if existing request is updated, then proceed. otherwise, upload nda document
    if (!!this.currentRequest && this.currentRequest.id) {
      return of('NO_NDA_NEEDED');
    } else {
      let data = (new SanadiAttachment()).clone(this.ndaFile) as SanadiAttachment;
      data.documentTitle = 'Non-Disclosure Form';
      data.attachmentType = AttachmentTypeEnum.NON_DISCLOSURE_FORM;
      let attachmentTypeInfo = this.lookup.listByCategory.ATTACHMENT_TYPE.find(x => x.lookupKey === AttachmentTypeEnum.NON_DISCLOSURE_FORM);
      data.attachmentTypeInfo = attachmentTypeInfo ? attachmentTypeInfo.convertToAdminResult() : new AdminResult();
      data.requestFullSerial = request.requestFullSerial;
      data.requestId = request.id;

      this.ndaAttachment = data;

      return this.attachmentService.saveAttachment(data, this.ndaFile)
        .pipe(catchError(() => {
          return of('FAILED_NDA_ATTACHMENT');
        }));
    }
  }

  private checkFormFieldsCallback() {
    this.dialogService.error(this.langService.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.displayFormValidity();
      });
  }

  private prepareBeneficiary(): Beneficiary {
    const personal = this.fm.getFormField('personalTab')?.value;
    const income = this.fm.getFormField('incomeTab')?.value;
    const address = this.fm.getFormField('addressTab')?.value;
    const buildingPlate = this.buildingPlate.getValue();
    return this.currentBeneficiary = (new Beneficiary())
      .clone({
        ...this.currentBeneficiary, ...personal, ...income, ...address, ...buildingPlate,
        disableDataSharing: this.disableDataSharingField.value || false,
        beneficiaryIncomeSet: this.beneficiaryIncomeComponentRef.list,
        beneficiaryObligationSet: this.beneficiaryObligationComponentRef.list
      });
  }

  private prepareRequest(): SubventionRequest {
    const request = {
      ...this.currentRequest,
      ...this.fm.getFormField('requestInfoTab')?.value,
      ...this.fm.getFormField('requestStatusTab')?.value,
      requestChannel: 1 // SANADI PORTAL
    };
    return this.currentRequest = (new SubventionRequest()).clone(request);
  }

  private listenToRouteParams() {
    const requestId$ = this.activeRoute.params
        .pipe(
          filter(params => params.hasOwnProperty('id')),
          pluck('id'),
          tap(_ => {
            this.currentParamType = this.routeParamTypes.normal;
          })
        ),
      partialRequestId$ = this.activeRoute.params
        .pipe(
          filter(params => params.hasOwnProperty('partial-id')),
          pluck('partial-id'),
          tap(_ => {
            this.currentParamType = this.routeParamTypes.partial;
          })
        );

    merge(requestId$, partialRequestId$)
      .pipe(
        switchMap((requestId: number) => {
          if (this.currentParamType === this.routeParamTypes.normal) {
            return this.subventionResponseService.loadById(requestId);
          } else if (this.currentParamType === this.routeParamTypes.partial) {
            return this.subventionResponseService.loadNewPartialRequestDataById(requestId)
              .pipe(
                catchError((err) => {
                  this.currentParamType = this.routeParamTypes.normal;
                  // this.exceptionHandlerService.handle(err);
                  return of(null);
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((response: SubventionResponse | null) => {
        if (!response) {
          return;
        }

        this.beneficiaryChanged$.next(response.beneficiary);
        this.subventionAidList = response.aidList;
        this.subventionAidDataSource.next(this.subventionAidList);
        this.attachmentList = response.attachmentList;

        this.form.setControl('requestStatusTab', this.buildRequestStatusTab(response.request));

        this.isPartialRequest = response.request.isPartial;

        if (this.currentParamType === this.routeParamTypes.partial) {
          response.request.statusDateModified = response.request.creationDate;
          response.request.statusDateModifiedString = response.request.creationDateString;
          this.editMode = false;
        } else {
          if (!response.request.isUnderProcessing()) {
            this.readModeService.setReadOnly(response.request.id);
          }
          this.editMode = true;
        }

        this.requestChanged$.next(response.request);

        // if partial request page, save it directly
        if (this.currentParamType === this.routeParamTypes.partial) {
          this.savePartial$.next(this.saveActions.partialSave);
        }
      });
  }

  saveModel() {
    if (this.currentParamType === this.routeParamTypes.partial) {
      this.savePartial$.next(this.saveActions.partialSave);
    } else {
      this.save$.next(this.saveActions.validateAndSave);
    }
  }

  getBeneficiaryData($event?: Event) {
    $event?.preventDefault();
    const idType = this.primaryIdTypeField?.value;
    const primaryNumber = this.primaryIdNumberField?.value;
    const nationality = this.primaryNationalityField?.value;

    if (!primaryNumber || !idType || !nationality) {
      this.dialogService.info(this.langService.map.msg_invalid_search_criteria);
      return;
    }


    this.beneficiaryService
      .loadByCriteria({
        benPrimaryIdNumber: primaryNumber ? primaryNumber : undefined,
        benPrimaryIdType: primaryNumber ? idType : undefined,
        benPrimaryIdNationality: nationality ? nationality : undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        if (!list.length) {
          this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
          return;
          // return this.beneficiaryChanged$.next(null);
        }
        list.length > 1 ? this.beneficiaryService.openSelectBeneficiaryDialog(list).onAfterClose$.subscribe((beneficiary) => {
          if (beneficiary instanceof Beneficiary) {
            this.beneficiaryChanged$.next(beneficiary);
          }
        }) : this.beneficiaryChanged$.next(list[0]);
      });
  }

  disableEnter(event: KeyboardEvent): void {
    const element = event.target as HTMLInputElement;
    if (event.code === 'NumpadEnter' || event.code === 'Enter' && element.value.trim().length) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  saveAid() {
    this.saveAid$.next();
  }

  cancelAid() {
    this.resetAid();
    this.editAidItem = undefined;
  }

  private preparePeriodicityLookups(): void {
    this.periodicityLookups = this.lookup.listByCategory.SubAidPeriodicType.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, {} as Record<number, Lookup>);
  }

  private resetAid() {
    this.aidFormArray.clear();
    this.aidFormArray.markAsUntouched();
    this.aidFormArray.markAsPristine();
  }

  private validateAidAmount(): 'VALID' | 'INVALID_ONE_TIME' | 'INVALID_MONTHLY' {
    const aidPeriodicType = this.aidPeriodicType?.value,
      givenAmount = this.aidGivenAmountField?.value,
      estimatedAmount = this.aidEstimatedAmountField?.value,
      numberOfInstallments = this.aidInstallmentsCount?.value;
    if (aidPeriodicType === SubAidPeriodicTypeEnum.ONE_TIME && (Number(givenAmount) > Number(estimatedAmount))) {
      return 'INVALID_ONE_TIME';
    } else if (aidPeriodicType === SubAidPeriodicTypeEnum.MONTHLY && (Number(givenAmount) * Number(numberOfInstallments)) > Number(estimatedAmount)) {
      return 'INVALID_MONTHLY';
    }
    return 'VALID';
  }

  private listenToSaveAid() {
    const aidForm$ = this.saveAid$.pipe(map(() => {
      return this.fm.getFormField('aidTab.0') as AbstractControl;
    }));

    const validForm$ = aidForm$.pipe(
      filter((form) => form.valid),
      map(_ => {
        const aidAmountValidation = this.validateAidAmount(),
          message = {
            INVALID_MONTHLY: this.langService.map.msg_invalid_given_amount_monthly,
            INVALID_ONE_TIME: this.langService.map.msg_invalid_given_amount_one_time,
          };
        if (aidAmountValidation !== 'VALID') {
          this.dialogService
            .error(message[aidAmountValidation])
            .onAfterClose$
            .subscribe();
        }
        return aidAmountValidation;
      }),
      filter((value: string) => value === 'VALID')
    );
    const invalidForm$ = aidForm$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.langService.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.aidFormArray?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return this.fm.getFormField('aidTab.0') as FormArray;
      }),
      map((form) => {

        return (new SubventionAid()).clone({
          ...this.currentAid, ...form.getRawValue(),
          subventionRequestId: this.currentRequest?.id
        });
      }),
      exhaustMap((aid) => {
        if (!this.currentRequest || !this.currentRequest.id) {
          return of(aid);
        }
        return aid.save()
          .pipe(catchError(() => of(null)));
      })
    ).subscribe((subventionAid) => {
      if (!subventionAid) {
        return;
      }
      let message: string,
        requestedAidCategory = this.mainAidLookupsList.find(x => x.id === subventionAid.aidLookupParentId),
        requestedAid = this.subAidLookupsList.find(x => x.id === subventionAid.aidLookupId),
      periodicType = this.lookup.listByCategory.SubAidPeriodicType.find(x => x.lookupKey === subventionAid.periodicType);

      let savedRecord = (subventionAid as SubventionAid).clone({
        aidLookupParentInfo: requestedAidCategory ? requestedAidCategory.convertToAdminResult() : new AdminResult(),
        aidLookupInfo: requestedAid ? requestedAid.convertToAdminResult() : new AdminResult(),
        periodicTypeInfo: periodicType ? periodicType.convertToAdminResult() : new AdminResult()
      });

      if (!this.editAidItem) {
        this.subventionAidList.push(savedRecord);
        message = this.langService.map.msg_aid_added_successfully;
      } else {
        let index = this.subventionAidList.findIndex(x => x === this.editAidItem);
        this.subventionAidList.splice(index, 1, savedRecord);
        this.editAidItem = undefined;
        message = this.langService.map.msg_aid_updated_successfully;
      }
      this.toastService.success(message);
      this.subventionAidList = this.subventionAidList.slice();
      this.subventionAidDataSource.next(this.subventionAidList);
      this.aidChanged$.next(null);
    });
  }

  private listenToRequestChange() {
    this.requestChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((request) => {
        this.currentRequest = request || undefined;
        this.updateRequestForm(this.currentRequest);
      });
  }

  private listenToAidChange() {
    this.aidChanged$.pipe(takeUntil(this.destroy$)).subscribe((aid) => {
      this.currentAid = aid || undefined;
      this.updateAidForm(this.currentAid);
    });
  }

  private _setPaymentDateValidations() {
    const approvedDateValue = DateUtils.changeDateFromDatepicker(this.aidApprovalDate?.value);

    let minDate = DateUtils.changeDateFromDatepicker(this.creationDateField?.value);
    if (minDate) {
      minDate.setHours(0, 0, 0, 0);
    }
    let minFieldName = 'creationDate';

    if (approvedDateValue) {
      if (DateUtils.isGreaterThan(approvedDateValue, minDate)) {
        minFieldName = 'aidApprovalDate';
        minDate = approvedDateValue;
      }
    }

    this.setRelatedMinDate(minFieldName, 'aidPaymentDate');
    // @ts-ignore
    this.aidPaymentDate?.setValidators([CustomValidators.required, CustomValidators.minDate(minDate)]);
    this.aidPaymentDate?.updateValueAndValidity();
  }

  private updateAidForm(aid: SubventionAid | undefined) {
    this.aidFormArray.clear();

    if (aid) {
      this.aidFormArray.push(this.fb.group(aid.getAidFields(true)));
      this._buildDatepickerControlsMap();
      this.loadAidsSubAidLookups(aid.aidLookupParentId);
      this.aidsPeriodicTypeChange(aid.periodicType);
      this.aidPeriodicType.updateValueAndValidity();

      const requestCreationDateValue = DateUtils.changeDateFromDatepicker(this.creationDateField?.value);
      if (this.creationDateField && requestCreationDateValue) {
        this.setRelatedMinDate('creationDate', 'aidApprovalDate');
        this.aidApprovalDate?.setValidators([CustomValidators.required, CustomValidators.minDate(requestCreationDateValue)]);
      }

      this._setPaymentDateValidations();

      this.aidApprovalDateSub = this.aidApprovalDate?.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(_ => {
        this._setPaymentDateValidations();
      });
    } else {
      this.aidApprovalDateSub?.unsubscribe();
    }
  }

  get aidFormArray(): FormArray {
    return this.fm.getFormField('aidTab') as FormArray;
  }

  get personalInfoTab(): FormGroup {
    return this.fm.getFormField('personalTab') as FormGroup;
  }

  get incomeTab(): FormGroup {
    return this.fm.getFormField('incomeTab') as FormGroup;
  }

  get addressTab(): FormGroup {
    return this.fm.getFormField('addressTab') as FormGroup;
  }

  get requestInfoTab(): FormGroup {
    return this.fm.getFormField('requestInfoTab') as FormGroup;
  }

  get disableDataSharingField(): FormControl {
    return this.fm.getFormField('disableDataSharing') as FormControl;
  }

  get requestStatusTab(): FormGroup {
    return this.fm.getFormField('requestStatusTab') as FormGroup;
  }

  get attachmentsTab(): FormGroup {
    return this.fm.getFormField('attachmentsTab') as FormGroup;
  }

  get dateOfBirthField(): FormControl {
    return this.personalInfoTab.get('dateOfBirth') as FormControl;
  }

  get creationDateField(): FormControl {
    return this.requestInfoTab.get('creationDate') as FormControl;
  }

  get requestDateField(): FormControl {
    return this.requestInfoTab.get('creationDate') as FormControl;
  }

  get statusDateModifiedField(): FormControl {
    return this.requestStatusTab.get('statusDateModified') as FormControl;
  }

  get aidTypeField(): FormControl {
    return this.aidFormArray.get('0.aidLookupId') as FormControl;
  }

  get aidGivenAmountField(): FormControl {
    return this.aidFormArray.get('0.aidAmount') as FormControl;
  }

  get aidEstimatedAmountField(): FormControl {
    return this.aidFormArray.get('0.aidSuggestedAmount') as FormControl;
  }

  get aidInstallmentsCount(): FormControl {
    return this.aidFormArray.get('0.installementsCount') as FormControl;
  }

  get aidPeriodicType(): FormControl {
    return this.aidFormArray.get('0.periodicType') as FormControl;
  }

  get aidApprovalDate(): FormControl {
    return this.aidFormArray.get('0.approvalDate') as FormControl;
  }

  get aidPaymentDate(): FormControl {
    return this.aidFormArray.get('0.aidStartPayDate') as FormControl;
  }

  get benNationalityField(): FormControl {
    return this.fm.getFormField('personalTab.benNationality') as FormControl;
  }

  get primaryIdTypeField(): FormControl {
    return this.fm.getFormField('personalTab.benPrimaryIdType') as FormControl;
  }

  get primaryIdNumberField(): FormControl {
    return this.fm.getFormField('personalTab.benPrimaryIdNumber') as FormControl;
  }

  get primaryNationalityField(): FormControl {
    return this.fm.getFormField('personalTab.benPrimaryIdNationality') as FormControl;
  }

  get secondaryIdTypeField(): FormControl {
    return this.fm.getFormField('personalTab.benSecIdType') as FormControl;
  }

  get secondaryIdNumberField(): FormControl {
    return this.fm.getFormField('personalTab.benSecIdNumber') as FormControl;
  }

  get secondaryNationalityField(): FormControl {
    return this.fm.getFormField('personalTab.benSecIdNationality') as FormControl;
  }

  get requestedAidField(): FormControl {
    return this.fm.getFormField('requestInfoTab.aidLookupId') as FormControl;
  }

  get aidsRequestedAidField(): FormControl {
    return this.fm.getFormField('aidTab.0.aidLookupId') as FormControl;
  }

  get allowCompletionField(): FormControl {
    return this.fm.getFormField('requestInfoTab.allowCompletion') as FormControl;
  }

  get isCurrentRequestPartial(): boolean {
    return !this.currentRequest ? false : this.currentRequest.isPartial;
  }

  deleteAid(subventionAid: SubventionAid, $event?: MouseEvent): any {
    $event?.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          subventionAid.delete()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              let index = this.subventionAidList.findIndex(x => x === subventionAid);
              this.subventionAidList.splice(index, 1);
              this.toastService.success(this.langService.map.msg_delete_success);
              if (!this.subventionAidList.length) {
                this.aidChanged$.next(new SubventionAid());
              }
              this.subventionAidDataSource.next(this.subventionAidList);
            });
        }
      });
  }

  editAid(row: SubventionAid, $event?: MouseEvent) {
    $event?.preventDefault();
    this.editAidItem = row;
    this.aidChanged$.next(row);
  }

  getPeriodicityLookup(lookupKey: number): Lookup {
    return this.periodicityLookups[lookupKey];
  }

  private listenToAddAid() {
    this.addAid$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aidChanged$.next(new SubventionAid());
      });
  }

  private loadMainAidLookups() {
    this.mainAidLookupsList = [];
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.MAIN_CATEGORY,
      status: StatusEnum.ACTIVE
    }).pipe(
      catchError(err => of([]))
    ).subscribe((list) => {
      this.mainAidLookupsList = list;
    });
  }

  handleMainAidChange($event: number) {
    this.requestedAidField.reset();
    this.loadSubAidLookups($event);
  }

  private loadSubAidLookups(mainAidId: number) {
    this.subAidLookupsList = [];

    this.loadSubAidsByMainAidId(mainAidId).subscribe(list => {
      this.subAidLookupsList = list;
    });
  }

  handleAidsMainAidChange($event: number) {
    this.aidsRequestedAidField.reset();
    this.loadAidsSubAidLookups($event);
  }

  private loadAidsSubAidLookups(mainAidId: number) {
    this.aidsSubAidLookupsList = [];

    this.loadSubAidsByMainAidId(mainAidId).subscribe(list => {
      this.aidsSubAidLookupsList = list;
    });
  }

  private loadSubAidsByMainAidId(mainAidId: number): Observable<AidLookup[]> {
    if (!mainAidId) {
      return of([]);
    }
    return this.aidLookupService.loadByCriteria({
      aidType: AidTypes.SUB_CATEGORY,
      status: StatusEnum.ACTIVE,
      parent: mainAidId
    }).pipe(
      catchError(err => of([]))
    )
  }

  aidsPeriodicTypeChange(value: number, userInteraction: boolean = false) {
    if (value === PeriodicPayment.MONTHLY) {
      this.aidInstallmentsCount?.setValidators([CustomValidators.required, CustomValidators.number, Validators.min(1)]);
      this.aidInstallmentsCount.enable();
    } else {
      this.aidInstallmentsCount.setValidators([CustomValidators.number, Validators.min(1)]);
      this.aidInstallmentsCount.setValue(0);
      this.aidInstallmentsCount.disable();
    }
    this.aidInstallmentsCount.updateValueAndValidity();
  }

  cancelRequest(): any {
    return this.navigationService.goToBack();
  }

  private listenToRequestDateChange() {
    this.creationDateField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (this.currentRequest) {
        this.fm.getFormField('requestStatusTab')?.get('status')?.updateValueAndValidity();
        const requestDate = DateUtils.changeDateFromDatepicker(value);
        if (requestDate) {
          requestDate.setHours(0, 0, 0, 0);
          this.setRelatedMinDate('creationDate', 'aidApprovalDate');
          this.aidApprovalDate?.setValidators([CustomValidators.required, CustomValidators.minDate(requestDate)]);
          this.aidApprovalDate?.updateValueAndValidity();

          this.setRelatedMinDate('creationDate', 'aidPaymentDate');
          this.aidPaymentDate?.setValidators([CustomValidators.required, CustomValidators.minDate(requestDate)]);
          this.aidPaymentDate?.updateValueAndValidity();
        }
      }
    });
  }

  private listenToRequestStatusChange(group: FormGroup) {
    group.get('status')?.valueChanges
      .pipe(
        pairwise(),
        takeUntil(this.destroy$)
      )
      .subscribe(([oldValue, newValue]: SubventionRequestStatus[]) => {
        if (this.requestStatusArray.indexOf(newValue) !== -1 && this.subventionAidList.length) {
          this.dialogService.error(this.langService.map.remove_provided_aid_first_to_change_request_status);
          group.get('status')?.setValue(oldValue);
        }
        this.setRelatedMinDate('creationDate', 'statusDateModified');
        let creationDate = DateUtils.changeDateFromDatepicker(this.creationDateField?.value);
        if (creationDate) {
          creationDate.setHours(0, 0, 0, 0);
        }
        if (newValue === SubventionRequestStatus.APPROVED) {
          group.get('statusDateModified')?.setValidators([CustomValidators.required, CustomValidators.minDate(creationDate || '')]);
        } else {
          group.get('statusDateModified')?.setValidators(CustomValidators.minDate(creationDate || ''));
        }
        group.get('statusDateModified')?.updateValueAndValidity();
      });
  }

  isProvidedAidDisabled(): boolean {
    return this.requestStatusArray.indexOf(this.fm.getFormField('requestStatusTab')?.value?.status) !== -1;
  }

  private validRequestStatus(): boolean {
    const status = this.requestStatusTab.get('status');
    if (!status) {
      return true;
    }
    return !(status.value === SubventionRequestStatus.APPROVED && !this.subventionAidList.length);
  }

  private displayRequestStatusMessage(): void {
    this.dialogService.error(this.langService.map.msg_approved_request_without_one_aid_at_least);
  }

  private validateBeneficiaryResponse(value: Pair<BeneficiarySaveStatus, Beneficiary> | null): 'STOP' | 'CONTINUE' {
    if (!value) {
      return 'CONTINUE';
    }
    let stopRequestStatus = [
      BeneficiarySaveStatus.NDA_ACTIVE_REQUESTS_EXISTING,
      BeneficiarySaveStatus.NDA_RECENT_AID_EXISTING,
      BeneficiarySaveStatus.NDA_RECENT_PERIODIC_AIDS_EXISTING
    ]
    if (stopRequestStatus.includes(value.first)) {
      this.dialogService.info(this.langService.map[value.first as keyof ILanguageKeys]);
      return 'STOP';
    } else {
      return 'CONTINUE';
    }
  }

  private displayBeneficiaryExistsMessage(value: Pair<BeneficiarySaveStatus, Beneficiary> | null): any {
    if (!value) {
      return;
    }

    if (value.first === BeneficiarySaveStatus.EXISTING) {
      let confirmMsg: DialogRef;
      if (this.empService.checkPermissions('SUBVENTION_AID_SEARCH')) {
        confirmMsg = this.dialogService.confirmWithTree(this.langService.map.beneficiary_already_exists, {
          actionBtn: 'btn_continue',
          thirdBtn: 'btn_save_and_inquire',
          cancelBtn: 'btn_clear',
          showCloseIcon: true
        })
      } else {
        confirmMsg = this.dialogService.confirm(this.langService.map.beneficiary_already_exists, {
          actionBtn: 'btn_continue',
          cancelBtn: 'btn_clear',
          showCloseIcon: true
        })
      }
      confirmMsg.onAfterClose$
        .pipe(take(1))
        .subscribe((click: UserClickOn) => {
          if (!CommonUtils.isValidValue(click) || click === UserClickOn.CLOSE) {
            return;
          }
          if (click === UserClickOn.YES) {
            // continue
            this.validateStatus = false;
            this.save$.next(this.saveActions.skipValidateAndSave);
          } else if (click === UserClickOn.NO) {
            // clear
            if (this.currentParamType === this.routeParamTypes.normal) {
              this.beneficiaryChanged$.next(null);
              this.requestChanged$.next(null);

              this.form.markAsUntouched();
              this.form.markAsPristine();
            }
          } else if (click === UserClickOn.THIRD_BTN) {
            // save and inquire
            this.validateStatus = false;
            this.save$.next(this.saveActions.saveAndInquire);
          }
        });
    }
  }

  setRelatedMinDate(fromFieldName: string, toFieldName: string, disableSameDate: boolean = false): void {
    DateUtils.setRelatedMinDate({
      fromFieldName: fromFieldName,
      toFieldName: toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap,
      disableSelectedFromRelated: disableSameDate
    });
  }

  isPrimaryIdTypeDisabled(optionValue: number): boolean {
    return this.fm.getFormField('personalTab.benSecIdType')?.value === optionValue;
  }

  isSecondaryIdTypeDisabled(optionValue: number): boolean {
    return this.fm.getFormField('personalTab.benPrimaryIdType')?.value === optionValue;
  }

  private setNationalityVisibility(identification: string, idType: number): boolean {
    if (!CommonUtils.isValidValue(idType)) {
      return false;
    }
    let visibility: boolean = (idType === this.idMap.passport || idType === this.idMap.gccId),
      nationalityListType: ('normal' | 'gulf') = 'normal';
    if (idType === this.idMap.gccId) {
      nationalityListType = 'gulf';
    }

    if (identification.toLowerCase() === 'primary') {
      this.displayPrimaryNationality = visibility;
      this.primaryNationalityListType = nationalityListType;
    } else {
      this.displaySecondaryNationality = visibility;
      this.secondaryNationalityListType = nationalityListType;
    }
    return visibility;
  }

  private getNationalityByIdType(idType: number): string | number {
    if (!CommonUtils.isValidValue(idType)) {
      return '';
    }
    let nationalityValue: string | number = '';
    if (idType === this.idMap.qid || idType === this.idMap.visa) {
      nationalityValue = 1;
    }
    return nationalityValue;
  }

  private listenToPrimaryIdTypeChange() {
    this.primaryIdTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      let idValidators: any[] = [CustomValidators.required], nationalityValidators = null;

      if (CommonUtils.isValidValue(value)) {
        idValidators = idValidators.concat(this.idTypesValidationsMap[value]);

        if (value === this.idMap.passport || value === this.idMap.gccId) {
          nationalityValidators = [CustomValidators.required];
        }
      }

      this.primaryIdNumberField.setValue(null);
      this.primaryIdNumberField.setValidators(idValidators);
      this.primaryIdNumberField.updateValueAndValidity();

      this.primaryNationalityField.setValue(this.getNationalityByIdType(value));
      this.primaryNationalityField.setValidators(nationalityValidators);
      this.primaryNationalityField.updateValueAndValidity();

      this.setNationalityVisibility('primary', value);
    });
  }

  private listenToSecondaryIdTypeChange() {
    this.secondaryIdTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      let idValidators: any[] = [], nationalityValidators = null;

      if (CommonUtils.isValidValue(value)) {
        idValidators = [CustomValidators.required].concat(this.idTypesValidationsMap[value]);

        if (value === this.idMap.passport || value === this.idMap.gccId) {
          nationalityValidators = [CustomValidators.required];
        }
      }

      this.secondaryIdNumberField.setValue(null);
      this.secondaryIdNumberField.setValidators(idValidators);
      this.secondaryIdNumberField.updateValueAndValidity();

      this.secondaryNationalityField.setValue(this.getNationalityByIdType(value));
      this.secondaryNationalityField.setValidators(nationalityValidators);
      this.secondaryNationalityField.updateValueAndValidity();

      this.setNationalityVisibility('secondary', value);
    });
  }

  beneficiaryPrimaryIdDisabled(nationality: boolean = false): boolean {
    if (this.isPartialRequest) {
      return true;
    } else {
      if (nationality) {
        return this.readOnly;
      }
      return this.readOnly || this.editMode;
    }
  }

  beneficiarySecondaryIdDisabled(nationality: boolean = false): boolean {
    if (this.isPartialRequest) {
      return !!this.currentBeneficiary?.benSecIdType && !!this.currentBeneficiary?.benSecIdNumber;
    } else {
      if (nationality) {
        return this.readOnly;
      } else {
        if (this.readOnly) {
          return true;
        } else if (!this.editMode) {
          return false;
        }
        return !!this.currentBeneficiary?.benSecIdType && !!this.currentBeneficiary?.benSecIdNumber;
      }
    }
  }

  // setButtonsVisibility(tab: any): void {
  //   /*const tabsNotToShowSave = [this.tabsData.aids.name, this.tabsData.attachments.name];
  //   const tabsNotToShowValidate = [this.tabsData.aids.name, this.tabsData.attachments.name];
  //   this.saveVisible = !tab.name || (tabsNotToShowSave.indexOf(tab.name) === -1);
  //   this.validateFieldsVisible = !tab.name || (tabsNotToShowValidate.indexOf(tab.name) === -1);*/
  // }

  updateAttachmentList(attachments: SanadiAttachment[]): void {
    this.attachmentList = [];
    this.attachmentList = attachments;
  }

  saveButtonEnabled(): boolean {
    if (this.isPartialRequest) {
      return this.form.valid && this.buildingPlate.isValidForm();
    } else {
      if (this.readOnly) {
        return false;
      }
      return this.form.valid && this.buildingPlate.isValidForm();
    }
  }

  addAidAllowed(): boolean {
    return !this.readOnly && !this.isPartialRequest;
  }

  handleNDAFieldChange($event: any): void {
    if (!this.disableDataSharingField.value) {
      this.ndaFile = undefined;
    }
  }

  setNDAFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.ndaFile = file;
    } else {
      this.ndaFile = file[0];
    }
  }

  /**
   * @description Check if user can navigate to other pages
   */
  canDeactivate(): CanNavigateOptions {
    if (this.skipConfirmUnsavedChanges || !this.form.dirty) {
      return 'ALLOW';
    }
    return 'CONFIRM_UNSAVED_CHANGES';
  }

  displayFormValidity(contentId: string = ''): void {
    this.fm.displayFormValidity(contentId);
    this.buildingPlate.displayFormValidity();
  }

  getTabInvalidStatus(tabName: string): boolean {
    let validStatus = this.tabsData[tabName].validStatus();
    if (!this.tabsData[tabName].checkTouchedDirty) {
      return !validStatus;
    }
    return !validStatus && this.tabsData[tabName].isTouchedOrDirty();
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }
}
