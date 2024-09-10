import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {BehaviorSubject, iif, merge, Observable, of, Subject} from 'rxjs';
import {
  catchError,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  pairwise,
  pluck,
  switchMap,
  take,
  takeUntil,
  tap
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
import {AidLookupStatusEnum, BenOccupationStatusEnum, SubventionRequestStatus} from '@app/enums/status.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {PeriodicPayment, SubAidPeriodicTypeEnum} from '@app/enums/periodic-payment.enum';
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
import {AidTypes} from '@app/enums/aid-types.enum';
import {ECookieService} from '@app/services/e-cookie.service';
import {DateUtils} from '@app/helpers/date-utils';
import {EmployeeService} from '@app/services/employee.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {BuildingPlateComponent} from '@app/shared/components/building-plate/building-plate.component';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {CommonUtils} from '@app/helpers/common-utils';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {
  BeneficiaryObligationComponent
} from '@app/sanady/shared/beneficiary-obligation/beneficiary-obligation.component';
import {BeneficiaryIncomeComponent} from '@app/sanady/shared/beneficiary-income/beneficiary-income.component';
import {FileExtensionsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {AttachmentListComponent} from '@app/shared/components/attachment-list/attachment-list.component';
import {AttachmentTypeEnum} from '@app/enums/attachment-type.enum';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {Donor} from '@app/models/donor';
import {DonorService} from '@services/donor.service';
import {SharedService} from '@services/shared.service';
import {BeneficiaryRequesterRelationTypes} from '@app/enums/beneficiary-requester-relation-types';
import {CanComponentDeactivateContract} from '@contracts/can-component-deactivate-contract';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';
import {BeneficiaryFamilyMemberComponent} from '@app/sanady/shared/beneficiary-family-members/beneficiary-family-members.component';
import {ConfirmNdaCasePopupComponent} from '@app/sanady/popups/confirm-nda-case-popup/confirm-nda-case-popup.component';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivateContract {
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
              private donorService: DonorService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private cd: ChangeDetectorRef,
              private sharedService: SharedService,
              private navigationService: NavigationService,
              private readModeService: ReadModeService,
              private attachmentService: AttachmentService, // to use in interceptor
              private fb: UntypedFormBuilder,
              private empService: EmployeeService,
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
    this.listenToAidChange();
    this.listenToSaveModel();
    this.listenToSavePartialRequest();
    this.listenToSaveAid();
    this.listenToAddAid();
    this.listenToReloadAids();
    this.listenToNationalityChange();
    this.listenToPrimaryIdTypeChange();
    this.listenToSecondaryIdTypeChange();
    this.preparePeriodicityLookups();
    this.loadMainAidLookups();
    this.loadDonors();
  }

  ngAfterViewInit(): void {
    this.handleRequesterRelationTypeChange();
    this.listenToRouteParams();
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

  private destroy$: Subject<void> = new Subject();
  private save$: Subject<any> = new Subject<any>();
  private savePartial$: Subject<any> = new Subject<any>();
  private saveAid$: Subject<void> = new Subject<void>();
  private beneficiaryChanged$: Subject<Beneficiary | null> = new Subject<Beneficiary | null>();
  private requestChanged$: Subject<SubventionRequest | null> = new Subject<SubventionRequest | null>();
  private aidChanged$: Subject<SubventionAid | null> = new Subject<SubventionAid | null>();
  public currentBeneficiary?: Beneficiary;
  private currentAid?: SubventionAid;
  addAid$: Subject<any> = new Subject<any>();
  reloadAid$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  currentRequest?: SubventionRequest;
  subventionAidList: SubventionAid[] = [];
  subventionAidDataSource: BehaviorSubject<SubventionAid[]> = new BehaviorSubject<SubventionAid[]>([]);
  attachmentList: SanadiAttachment[] = [];
  form!: UntypedFormGroup;
  mainAidLookupsList: AidLookup[] = [];
  subAidLookupsList: AidLookup[] = [];
  donorList: Donor[] = [];
  subventionRequestStatusEnum = SubventionRequestStatus;

  aidsSubAidLookupsList: AidLookup[] = [];
  periodicityLookups: Record<number, Lookup> = {};
  editAidItem?: SubventionAid;
  editMode = false;
  isBeneficiaryEnquired = false;
  isUserRequestPage = true;

  aidsActions: IMenuItem<SubventionAid>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: SubventionAid) => this.editAid(item),
      disabled: () => {
        return this.readOnly || (!!this.currentRequest && this.isPartialRequest && !this.currentRequest.isUnderProcessing());
      }
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: SubventionAid) => this.deleteAid(item),
      show: () => {
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
    'donor',
    'installmentsCount',
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
    aidPaymentDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    expiryDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  fileExtensionsEnum = FileExtensionsEnum;

  readOnly = false;
  isPartialRequest: boolean = false;
  private requestStatusArray: SubventionRequestStatus[] = [SubventionRequestStatus.REJECTED, SubventionRequestStatus.SAVED];
  private validateBeneficiary: boolean = true;
  private validateMophBeneficiary: boolean = true;

  beneficiaryIdTypesEnum = BeneficiaryIdTypes;
  idTypes: Lookup[] = this.lookup.listByCategory.BenIdType;
  displayPrimaryNationality: boolean = false;
  displaySecondaryNationality: boolean = false;
  displayRequesterNationality: boolean = false;

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
  @ViewChild('beneficiaryFamily') beneficiaryFamilyComponentRef!: BeneficiaryFamilyMemberComponent;
  beneficiaryObligationsStatus: ReadinessStatus = 'READY';
  beneficiaryIncomesStatus: ReadinessStatus = 'READY';
  beneficiaryFamilyStatus: ReadinessStatus = 'READY';

  tabsData: TabMap = {
    personal: {
      name: 'personalTab',
      langKey: 'personal_info',
      index: 0,
      // checkTouchedDirty: true,
      validStatus: () => (this.personalInfoTab && this.personalInfoTab.valid
          && (!this.beneficiaryFamilyComponentRef
            || (this.beneficiaryFamilyStatus === 'READY')
            && this.beneficiaryFamilyComponentRef.list.length == this.personalInfoTab.value.familyCount))
        || (this.personalInfoTab && this.personalInfoTab.disabled),
      isTouchedOrDirty: () => (this.personalInfoTab
          && (this.personalInfoTab.touched
            || this.personalInfoTab.dirty))
        || (this.beneficiaryFamilyComponentRef
          && this.beneficiaryFamilyComponentRef.isTouchedOrDirty())
    },
    income: {
      name: 'incomeTab',
      langKey: 'income_obligation',
      index: 2,
      // checkTouchedDirty: true,
      validStatus: () => {
        return (!this.beneficiaryObligationComponentRef || (this.beneficiaryObligationsStatus === 'READY'))
          && (!this.beneficiaryIncomeComponentRef || (this.beneficiaryIncomesStatus === 'READY'))
          && (this.employmentStatusField.value !== BenOccupationStatusEnum.WORKING
            || !!this.beneficiaryIncomeComponentRef.list.length);
      },
      isTouchedOrDirty: () => {
        return (this.beneficiaryObligationComponentRef && this.beneficiaryObligationComponentRef.isTouchedOrDirty())
          || (this.beneficiaryIncomeComponentRef && this.beneficiaryIncomeComponentRef.isTouchedOrDirty());
      }
    },
    address: {
      name: 'addressTab',
      langKey: 'lbl_address',
      index: 1,
      // checkTouchedDirty: true,
      validStatus: () => this.addressTab && (this.addressTab.disabled || this.addressTab.valid) && !!this.buildingPlate && this.buildingPlate.isValidForm(),
      isTouchedOrDirty: () => (this.addressTab && (this.addressTab.touched || this.addressTab.dirty)) || (this.buildingPlate && this.buildingPlate.isTouchedOrDirty())
    },
    requestInfo: {
      name: 'requestInfoTab',
      langKey: 'request_info',
      index: 3,
      // checkTouchedDirty: true,
      validStatus: () => this.requestInfoTab && this.requestInfoTab.valid && this._isValidDisclosureFile(),
      isTouchedOrDirty: () => this.requestInfoTab && (this.requestInfoTab.touched || this.requestInfoTab.dirty)
    },
    requestStatus: {
      name: 'requestStatusTab',
      langKey: 'request_status',
      index: 5,
      // checkTouchedDirty: true,
      validStatus: () => this.requestStatusTab && this.requestStatusTab.valid,
      isTouchedOrDirty: () => this.requestStatusTab && (this.requestStatusTab.touched || this.requestStatusTab.dirty)
    },
    aids: {
      name: 'aidsTab',
      langKey: 'provided_aid',
      index: 4,
      // checkTouchedDirty: true,
      validStatus: () => this.aidFormArray && this.aidFormArray.valid,
      isTouchedOrDirty: () => this.aidFormArray && (this.aidFormArray.touched || this.aidFormArray.dirty)
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 6,
      // checkTouchedDirty: true,
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
  disclosureFile: any;
  disclosureAttachment: any;

  private buildForm(beneficiary?: Beneficiary, request?: SubventionRequest) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    request = request ? request : new SubventionRequest();
    this.form = this.fb.group({
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group(request.getInfoFields(true)),
      requestStatusTab: this.editMode ? this.buildRequestStatusTab(request) : null,
      aidTab: this.fb.array([])
    });
    this._buildDatepickerControlsMap();
  }

  private buildRequestStatusTab(request?: SubventionRequest): UntypedFormGroup {
    request = request ? request : new SubventionRequest();
    const group = this.fb.group(request.getStatusFields(true)) as UntypedFormGroup;
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
    });
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
        this.updateBeneficiaryForm(this.currentBeneficiary);
        setTimeout(() => {

          this.buildingPlate?.disableUpdateForExistingValues();
        }, 200);

      });
  }

  private updateBeneficiaryForm(selectedBeneficiary: undefined | Beneficiary) {
    if (!selectedBeneficiary) {
      this.personalInfoTab?.reset();
      this.personalInfoTab?.markAsPristine();
      this.beneficiaryIncomeComponentRef.forceClearComponent();
      this.beneficiaryObligationComponentRef.forceClearComponent();
      this.addressTab?.reset();
      this.addressTab?.markAsPristine();
    } else {
      this.personalInfoTab?.patchValue(selectedBeneficiary.getPersonalFields());
      this.addressTab?.patchValue(selectedBeneficiary.getAddressFields());

      this.requesterRelationTypeField.setValue(this.isRequesterSameAsBeneficiary());
    }
    // Object.entries(this.personalInfoTab.controls).forEach(([key,control])=>{
    //   if(this.searchInputs.includes(key)) return ;

    //   if(CommonUtils.isValidValue(control.value)){
    //     control.disable();
    //   }else{
    //     control.enable()  ;
    //   }
    // })

    this.personalInputs.forEach(item => {
      const control = this.personalInfoTab.controls[item];
      if (CommonUtils.isValidValue(control.value)) {
        control.disable();
      } else {
        control.enable();
      }
    });
    Object.values(this.addressTab.controls).forEach(control => {
      if (CommonUtils.isValidValue(control.value)) {
        control.disable();
      } else {
        control.enable();
      }

    });

    // this.handleRequesterRelationTypeChange((selectedBeneficiary ? selectedBeneficiary.benRequestorRelationType : undefined), false);
    this.handleRequesterRelationTypeChange();
    this.handleEmploymentStatusChange((selectedBeneficiary ? selectedBeneficiary.occuptionStatus : undefined), false);
    setTimeout(() => this.toggleRequesterRelationTypeReadonly(), 100);
  }

  searchInputs = ['benPrimaryIdType', 'benPrimaryIdNationality', 'expiryDate', 'benPrimaryIdNumber', 'benSecIdType', 'benSecIdNationality', 'benSecIdNumber'];
  personalInputs = ['arName', 'enName', 'gender', 'dateOfBirth'];

  private updateRequestForm(request: undefined | SubventionRequest) {
    if (!request) {
      this.requestInfoTab?.reset();
      this.requestStatusTab?.reset();
      this.readOnly = false;
      this.subAidLookupsList = [];
      this.handleAllowDataSharingFieldChange();
    } else {
      this.requestStatusTab?.patchValue(request.getStatusFields());
      this.requestInfoTab?.patchValue(request.getInfoFields());

      this.loadSubAidLookups(request.aidLookupParentId);
      this.allowDataSharingField?.disable();
      this.handleAllowDataSharingFieldChange();

      if (request.isPartial) {
        this.readOnly = !request.isUnderProcessing();
        this.toggleAllowCompletionReadonly();
        this.displayFormValidity();
      } else {
        if (request.id) {
          this.readOnly = this.readModeService.isReadOnly(request.id);
          this.toggleAllowCompletionReadonly();
          this.displayFormValidity();
        } else {
          this.readOnly = false;
        }
      }
    }
    this.toggleIsHandicappedReadonly();
  }

  isRequesterSameAsBeneficiary(): boolean {
    // true = BeneficiaryRequesterRelationTypes.SAME_AS_REQUESTER
    // false = BeneficiaryRequesterRelationTypes.RELATIVE_TO_REQUESTER

    if (!this.requesterRelationTypeField || !CommonUtils.isValidValue(this.requesterRelationTypeField.value)) {
      return false;
    } else {
      if (typeof this.requesterRelationTypeField.value === 'boolean') {
        return this.requesterRelationTypeField.value;
      } else {
        return this.requesterRelationTypeField.value === BeneficiaryRequesterRelationTypes.SAME_AS_REQUESTER;
      }
    }
  }

  handleRequesterRelationTypeChange($event?: any) {
    let userInteraction = !!$event;
    let dependentFields = [this.beneficiaryRequesterNameField, this.requesterIdTypeField, this.requesterIdNumberField, this.requesterNationalityField, this.requesterPhoneField];
    dependentFields.forEach((field: UntypedFormControl) => {
      if (!field) {
        return;
      }
      if (userInteraction) {
        field.setValue(null);
      }
      if (this.isRequesterSameAsBeneficiary()) {
        field.removeValidators(CustomValidators.required);
        field.disable();
      } else {
        field.addValidators(CustomValidators.required);
        field.enable();
      }
      field.updateValueAndValidity();
    });

    this.handleRequesterIdTypeChange(this.requesterIdTypeField.value, userInteraction);
  }

  isBeneficiaryWorking() {
    return this.employmentStatusField && (this.employmentStatusField.value === BenOccupationStatusEnum.WORKING);
  }

  handleEmploymentStatusChange(value?: number, userInteraction: boolean = false) {
    if (userInteraction) {
      this.occupationField?.setValue('');
      this.workPlaceField?.setValue('');
    }
    const required = (value && value !== BenOccupationStatusEnum.NOT_WORKING);
    if (required) {
      this.occupationField?.addValidators(CustomValidators.required);
      this.workPlaceField?.addValidators(CustomValidators.required);
    } else {
      this.occupationField?.removeValidators(CustomValidators.required);
      this.workPlaceField?.removeValidators(CustomValidators.required);
    }
    this.occupationField?.updateValueAndValidity();
    this.workPlaceField?.updateValueAndValidity();
  }

  gulfAreaLookupKeys: number[] = [1, 2, 122, 191, 171, 24];

  private listenToNationalityChange() {
    this.benNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      // 1 is Qatari
      if (!this.gulfAreaLookupKeys.includes(value)) {
        this.employerField?.setValidators([CustomValidators.required, CustomValidators.pattern('ENG_AR_ONLY')]);
      } else {
        this.employerField?.setValidators([CustomValidators.pattern('ENG_AR_ONLY')]);
      }
      this.employerField?.updateValueAndValidity();
    });


    this.primaryNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((_) => {
      if (this.primaryIdTypeField?.value === BeneficiaryIdTypes.PASSPORT && CommonUtils.isValidValue(this.primaryNationalityField?.value)) {
        this.benNationalityField?.setValue(this.primaryNationalityField?.value);
        this.benNationalityField?.updateValueAndValidity();
      }
    });

    this.secondaryNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((_) => {
      if (this.secondaryIdTypeField?.value === BeneficiaryIdTypes.PASSPORT && CommonUtils.isValidValue(this.secondaryNationalityField?.value)) {
        this.benNationalityField?.setValue(this.secondaryNationalityField?.value);
        this.benNationalityField?.updateValueAndValidity();
      }
    });
  }

  private _prepareBeneficiaryAndRequest(): { beneficiary: Beneficiary, request: SubventionRequest } {
    return {
      beneficiary: this.prepareBeneficiary(),
      request: this.prepareRequest(),
    };
  }

  isDisclosureFileRequired(): boolean {
    if (!!this.currentRequest?.id) {
      return false;
    }
    return !!this.allowDataSharingField?.value;
  }

  private _isValidDisclosureFile(): boolean {
    if (!this.isDisclosureFileRequired()) {
      return true;
    }
    return !!this.disclosureFile;
  }

  private listenToSavePartialRequest() {
    this.savePartial$.pipe(
      takeUntil(this.destroy$),
      delay(100),
      // validate form and filter invalid requests
      filter(() => {
        let isValid = this.form?.valid && this.buildingPlate.isValidForm();
        if (!isValid) {
          this.checkFormFieldsCallback();
        }
        return isValid;
      }),
      // prepare beneficiary and request
      map(() => this._prepareBeneficiaryAndRequest()),
      // save request
      switchMap((value) => {
        let data: SubventionResponse = new SubventionResponse().clone({
          request: value.request,
          beneficiary: value.beneficiary,
          aidList: this.subventionAidList,
          attachmentList: this.attachmentList
        });
        return this.subventionResponseService.savePartialRequest(data)
          .pipe(catchError(() => {
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
      // keep the original path of partial request page to use in case of back
      const previousPath = this.navigationService.previousPath;
      // after adding, open the request as normal
      this.router.navigate(['/home/sanady/request/', response.request.id]).then(() => {
        // update the previous path as partial request page original path
        this.navigationService.previousPath = previousPath;
      });
    });
  }

  private listenToSaveModel() {
    let saveType: string = '';
    this.save$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        tap(val => saveType = val),
        // validate request status and aids
        filter(() => {
          if (this.validRequestStatus()) {
            return true;
          } else {
            this.displayRequestStatusMessage();
            return false;
          }
        }),
        filter(() => {
          if (this.beneficiaryFamilyComponentRef.list.length !== this.personalInfoTab.value.familyCount) {
            this.displayFamilyMemberCountMessage();
            return false;
          }
          if (this.employmentStatusField.value === BenOccupationStatusEnum.WORKING && !this.beneficiaryIncomeComponentRef.list.length) {
            this.displayEmploymentStatusMessage();
            return false;
          }
          return true;
        }),
        // validate form and filter invalid requests
        filter(() => {
          let isValid = this.form?.valid && this.buildingPlate.isValidForm();
          // if edit mode, validate only form otherwise, validate allowDataSharing and disclosure file
          if (!!this.currentRequest && this.currentRequest.id) {
            return isValid;
          }
          isValid = isValid && (this._isValidDisclosureFile());

          if (!isValid) {
            this.checkFormFieldsCallback();
          }
          return isValid;
        })
      )
      .pipe(
        // prepare beneficiary and request
        map(() => this._prepareBeneficiaryAndRequest()),
        // check beneficiary obligation and income
        switchMap((requestAndBen) => {
          if (saveType !== this.saveActions.validateAndSave) {
            return of(requestAndBen);
          }
          return this.checkMissingBeneficiaryIncomeObligations(requestAndBen.beneficiary)
            .pipe(
              filter(response => response),
              map(() => requestAndBen)
            );
        }),
        // save beneficiary
        exhaustMap((requestAndBen) => {
          return requestAndBen.beneficiary.saveWithValidate(this.validateBeneficiary, this.currentRequest, this.validateMophBeneficiary)
            .pipe(catchError(() => of(null))).pipe(map((value) => {
              return {
                value,
                beneficiary: requestAndBen.beneficiary
              }
            }));
        }),
        filter((res) => this.validateBeneficiaryMOPHResponse(res.value) !== 'STOP'),
        filter((res) => this.validateBeneficiaryNDAResponse(res.value, res.beneficiary) !== 'STOP'),
        filter((res) => this.validateBeneficiaryExistenceResponse(res.value) !== 'STOP'),
        // check if BE returns beneficiary response
        map(res => {
          return res.value?.second ?? undefined;
        }),
        filter(value => !!value),
        map((beneficiary) => {
          this.currentBeneficiary = beneficiary;
          return beneficiary!;
        }),
      ).pipe(
      // set beneficiary id to request
      map((value: Beneficiary) => {
        let request = this.prepareRequest();
        request.benId = value.id as number;
        return request;
      }),
      // save request
      exhaustMap((request: SubventionRequest) => {
        return request.save().pipe(catchError(() => {
          return of(null);
        }));
      })
    )
      .subscribe((request) => {
        if (!request) {
          return;
        }

        this.uploadDisclosureDocument(request)
          .subscribe((disclosureAttachmentStatus) => {
            if (disclosureAttachmentStatus === 'FAILED_DISCLOSURE_ATTACHMENT') {
              this.dialogService.info(this.langService.map.msg_save_fail_x.change({x: this.langService.map.disclosure_document}));
            } else if (disclosureAttachmentStatus !== 'NO_DISCLOSURE_ATTACHMENT_NEEDED') {
              this.disclosureAttachment.vsId = disclosureAttachmentStatus;
              this.attachmentList.push(this.disclosureAttachment);
            }

            if (this.editMode) {
              this.dialogService.success(this.langService.map.msg_request_has_been_updated_successfully);
            } else {
              this.dialogService.success(this.langService.map.msg_request_has_been_added_successfully.change({serial: request.requestFullSerial}));
            }
            this.currentRequest = request.clone();
            this.editMode = true;

            this.toggleAllowCompletionReadonly();
            this.allowDataSharingField?.disable();

            if (!this.currentRequest.isUnderProcessing()) {
              this.readModeService.setReadOnly(this.currentRequest.id);
            }

            if (!this.requestStatusTab.value) {
              this.form.setControl('requestStatusTab', this.buildRequestStatusTab(this.currentRequest));
            }
            this.form.markAsPristine({onlySelf: true});

            this.disclosureAttachment = undefined;

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
  }

  isPrivateIdFieldGroupValid(): boolean {
    if (!this.primaryIdTypeField || !this.primaryIdNumberField) {
      return false;
    }

    const valid = this.primaryIdTypeField.valid && this.primaryIdNumberField.valid;
    if (!this._canShowNationalityField(this.primaryIdTypeField.value)) {
      return valid;
    }
    return valid && !!this.primaryNationalityField && this.primaryNationalityField.valid;
  }

  isSecondaryIdFieldGroupValid(): boolean {
    if (!this.secondaryIdTypeField || !this.secondaryIdNumberField) {
      return false;
    }

    const valid = this.secondaryIdTypeField.valid && this.secondaryIdNumberField.valid;
    if (!this._canShowNationalityField(this.secondaryIdTypeField.value)) {
      return valid;
    }
    return valid && !!this.secondaryNationalityField && this.secondaryNationalityField.valid;
  }

  isDownloadDisclosureFormAllowed(): boolean {
    if (!this.isPrivateIdFieldGroupValid()) {
      return false;
    }
    return (this.arabicNameField.disabled || this.arabicNameField.valid) &&
      (this.englishNameField.disabled || this.englishNameField.valid);
  }

  downloadDisclosureForm(): void {
    if (!this.isDownloadDisclosureFormAllowed()) {
      return;
    }
    this.subventionRequestService.loadDisclosureFormAsBlob(this.prepareBeneficiary())
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.sharedService.downloadFileToSystem(data.blob, 'Disclosure_Form');
      });
  }

  private uploadDisclosureDocument(request: SubventionRequest): Observable<any> {
    // if Disclosure not enabled or existing request is updated, then proceed. otherwise, upload nda document
    if ((this.currentRequest && this.currentRequest.id) || !request.allowDataSharing) {
      return of('NO_DISCLOSURE_ATTACHMENT_NEEDED');
    } else {
      let data = (new SanadiAttachment()).clone(this.disclosureFile) as SanadiAttachment;
      data.documentTitle = 'Disclosure Form';
      data.attachmentType = AttachmentTypeEnum.DISCLOSURE_FORM;
      let attachmentTypeInfo = this.lookup.listByCategory.ATTACHMENT_TYPE.find(x => x.lookupKey === AttachmentTypeEnum.DISCLOSURE_FORM);
      data.attachmentTypeInfo = attachmentTypeInfo ? attachmentTypeInfo.convertToAdminResult() : new AdminResult();
      data.requestFullSerial = request.requestFullSerial;
      data.requestId = request.id;

      this.disclosureAttachment = data;

      return this.attachmentService.saveAttachment(data, this.disclosureFile)
        .pipe(catchError(() => {
          return of('FAILED_DISCLOSURE_ATTACHMENT');
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

  private checkMissingBeneficiaryIncomeObligations(beneficiary: Beneficiary): Observable<boolean> {
    if (!beneficiary.beneficiaryIncomeSet.length || !beneficiary.beneficiaryObligationSet.length) {
      return this.dialogService.confirm(this.langService.map.msg_missing_incomes_or_obligations + '<br>' + this.langService.map.msg_confirm_continue)
        .onAfterClose$
        .pipe(
          map((userClickOn: UserClickOn) => {
            return userClickOn === UserClickOn.YES;
          })
        );
    }
    return of(true);
  }

  private prepareBeneficiary(): Beneficiary {
    return this.currentBeneficiary = (new Beneficiary())
      .clone({
        ...this.currentBeneficiary,
        ...this.personalInfoTab?.getRawValue(),
        ...this.addressTab?.value,
        ...this.buildingPlate.getValue(),
        benRequestorRelationType: this.isRequesterSameAsBeneficiary() ? BeneficiaryRequesterRelationTypes.SAME_AS_REQUESTER : BeneficiaryRequesterRelationTypes.RELATIVE_TO_REQUESTER,
        beneficiaryIncomeSet: !this.beneficiaryIncomeComponentRef ? [] : this.beneficiaryIncomeComponentRef.list,
        beneficiaryObligationSet: !this.beneficiaryObligationComponentRef ? [] : this.beneficiaryObligationComponentRef.list
      });
  }

  private prepareRequest(): SubventionRequest {
    const request = {
      ...this.currentRequest,
      ...this.requestInfoTab?.value,
      ...this.requestStatusTab?.value,
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
            this.isUserRequestPage = false;
          })
        ),
      partialRequestId$ = this.activeRoute.params
        .pipe(
          filter(params => params.hasOwnProperty('partial-id')),
          pluck('partial-id'),
          tap(_ => {
            this.currentParamType = this.routeParamTypes.partial;
            this.isUserRequestPage = false;
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
                map((data: SubventionResponse) => {
                  data.beneficiary = this.deleteBeneficiaryIds(data.beneficiary);
                  return data;
                }),
                catchError(() => {
                  this.currentParamType = this.routeParamTypes.normal;
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
          } else {
            this.isBeneficiaryEnquired = true;
          }
          this.editMode = true;
        }

        this.requestChanged$.next(response.request);

        // if partial request page, save it directly
        if (this.currentParamType === this.routeParamTypes.partial) {
          setTimeout(() => {
            this.savePartial$.next(this.saveActions.partialSave);
          }, 200);
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

  setExpiryDateForSanadyResult(list: Beneficiary[], expiryDate: IMyDateModel): Observable<Beneficiary[]> {
    list.forEach(x => {
      x.expiryDate = expiryDate;
    });
    return of(list);
  }

  get isQIDType(): boolean {
    return this.primaryIdTypeField?.value === BeneficiaryIdTypes.QID;
  }

  getBeneficiaryData($event?: Event) {
    $event?.preventDefault();
    $event?.stopPropagation();
    if (this.disableBeneficiarySearch()) {
      return;
    }
    const idType = this.primaryIdTypeField?.value;
    const primaryNumber = this.primaryIdNumberField?.value;
    const nationality = this.primaryNationalityField?.value;
    const expiryDate = this.expiryDateField?.value;

    if (!primaryNumber || !idType || !nationality) {
      this.dialogService.info(this.langService.map.msg_invalid_search_criteria);
      return;
    }
    if (this.isQIDType && !expiryDate && !this.editMode) {
      this.dialogService.info(this.langService.map.msg_QID_expiry_Date_required);
      return;

    }
    const criteria = {
      benPrimaryIdNumber: primaryNumber ? primaryNumber : undefined,
      benPrimaryIdType: primaryNumber ? idType : undefined,
      benPrimaryIdNationality: nationality ? nationality : undefined,

    };
    this.beneficiaryService.getBeneficiaryFromMoiData({...criteria, expiryDate})
      .pipe(
        switchMap((list) => {
          return iif(() => list.length > 0, of(list),
            this.beneficiaryService.loadByCriteria(criteria)
              .pipe(
                switchMap(list => this.setExpiryDateForSanadyResult(list, expiryDate))
              )
          );

        }),
        takeUntil(this.destroy$)
      )
      .subscribe(list => {
        if (!list.length) {
          this.dialogService.info(this.langService.map.no_result_for_your_search_criteria)
            .onAfterClose$.subscribe(() => {
            this.isBeneficiaryEnquired = true;
          });
          return;
        }
        if (list.length > 1) {
          this.beneficiaryService.openSelectBeneficiaryDialog(list).onAfterClose$.subscribe((beneficiary) => {
            if (beneficiary instanceof Beneficiary) {
              let ben = this.deleteBeneficiaryIds(beneficiary);
              this.beneficiaryChanged$.next(ben);
              this.isBeneficiaryEnquired = true;
            }
          });
        } else {
          let ben = this.deleteBeneficiaryIds(list[0]);
          this.beneficiaryChanged$.next(ben);
          this.isBeneficiaryEnquired = true;
        }
      });
  }

  deleteBeneficiaryIds(beneficiary: Beneficiary): Beneficiary {
    // @ts-ignore
    delete beneficiary.id;
    beneficiary.beneficiaryObligationSet.map((item) => {
      delete item.id;
      return item;
    });
    beneficiary.beneficiaryIncomeSet.map((item) => {
      delete item.id;
      return item;
    });
    return beneficiary;
  };

  disableEnter(event: KeyboardEvent): void {
    const element = event.target as HTMLInputElement;
    if (event.code === 'NumpadEnter' || event.code === 'Enter' && element.value.trim().length) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  disableBeneficiarySearch(): boolean {
    return this.readOnly || this.editMode || this.primaryIdNumberField?.invalid || this.primaryNationalityField?.invalid;
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
      return this.aidFormArray.get('0') as AbstractControl;
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
        return this.aidFormArray.get('0') as UntypedFormGroup;
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
      let message: string;

      if (!this.editAidItem) {
        message = this.langService.map.msg_aid_added_successfully;
      } else {
        message = this.langService.map.msg_aid_updated_successfully;
      }
      this.editAidItem = undefined;
      this.toastService.success(message);
      this.reloadAid$.next(null);
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

      this.aidApprovalDate?.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(_ => {
        this._setPaymentDateValidations();
      });
    }
  }

  get aidFormArray(): UntypedFormArray {
    return this.form.get('aidTab') as UntypedFormArray;
  }

  get personalInfoTab(): UntypedFormGroup {
    return this.form.get('personalTab') as UntypedFormGroup;
  }

  get addressTab(): UntypedFormGroup {
    return this.form.get('addressTab') as UntypedFormGroup;
  }

  get requestInfoTab(): UntypedFormGroup {
    return this.form.get('requestInfoTab') as UntypedFormGroup;
  }

  get requestStatusTab(): UntypedFormGroup {
    return this.form.get('requestStatusTab') as UntypedFormGroup;
  }

  get attachmentsTab(): UntypedFormGroup {
    return this.form.get('attachmentsTab') as UntypedFormGroup;
  }

  get dateOfBirthField(): UntypedFormControl {
    return this.personalInfoTab.get('dateOfBirth') as UntypedFormControl;
  }

  get creationDateField(): UntypedFormControl {
    return this.requestInfoTab.get('creationDate') as UntypedFormControl;
  }

  get requestDateField(): UntypedFormControl {
    return this.requestInfoTab.get('creationDate') as UntypedFormControl;
  }

  get requestStatusField(): UntypedFormControl {
    return this.requestStatusTab.get('status') as UntypedFormControl;
  }

  get statusDateModifiedField(): UntypedFormControl {
    return this.requestStatusTab.get('statusDateModified') as UntypedFormControl;
  }

  get aidGivenAmountField(): UntypedFormControl {
    return this.aidFormArray.get('0.aidAmount') as UntypedFormControl;
  }

  get aidEstimatedAmountField(): UntypedFormControl {
    return this.aidFormArray.get('0.aidSuggestedAmount') as UntypedFormControl;
  }

  get aidInstallmentsCount(): UntypedFormControl {
    return this.aidFormArray.get('0.installmentsCount') as UntypedFormControl;
  }

  get aidPeriodicType(): UntypedFormControl {
    return this.aidFormArray.get('0.periodicType') as UntypedFormControl;
  }

  get aidApprovalDate(): UntypedFormControl {
    return this.aidFormArray.get('0.approvalDate') as UntypedFormControl;
  }

  get aidPaymentDate(): UntypedFormControl {
    return this.aidFormArray.get('0.aidStartPayDate') as UntypedFormControl;
  }

  get aidsRequestedAidField(): UntypedFormControl {
    return this.aidFormArray.get('0.aidLookupId') as UntypedFormControl;
  }

  get benNationalityField(): UntypedFormControl {
    return this.personalInfoTab.get('benNationality') as UntypedFormControl;
  }

  get primaryIdTypeField(): UntypedFormControl {
    return this.personalInfoTab.get('benPrimaryIdType') as UntypedFormControl;
  }

  get primaryIdNumberField(): UntypedFormControl {
    return this.personalInfoTab.get('benPrimaryIdNumber') as UntypedFormControl;
  }

  get primaryNationalityField(): UntypedFormControl {
    return this.personalInfoTab.get('benPrimaryIdNationality') as UntypedFormControl;
  }

  get expiryDateField(): UntypedFormControl {
    return this.personalInfoTab.get('expiryDate') as UntypedFormControl;
  }

  get secondaryIdTypeField(): UntypedFormControl {
    return this.personalInfoTab.get('benSecIdType') as UntypedFormControl;
  }

  get secondaryIdNumberField(): UntypedFormControl {
    return this.personalInfoTab.get('benSecIdNumber') as UntypedFormControl;
  }

  get secondaryNationalityField(): UntypedFormControl {
    return this.personalInfoTab.get('benSecIdNationality') as UntypedFormControl;
  }

  get requesterRelationTypeField(): UntypedFormControl {
    return this.personalInfoTab.get('benRequestorRelationType') as UntypedFormControl;
  }

  get requesterIdTypeField(): UntypedFormControl {
    return this.personalInfoTab.get('requestorIdType') as UntypedFormControl;
  }

  get requesterIdNumberField(): UntypedFormControl {
    return this.personalInfoTab.get('requestorIdNumber') as UntypedFormControl;
  }

  get requesterNationalityField(): UntypedFormControl {
    return this.personalInfoTab.get('requestorIdNationality') as UntypedFormControl;
  }

  get requesterPhoneField(): UntypedFormControl {
    return this.personalInfoTab.get('requestorPhoneNumber') as UntypedFormControl;
  }

  get arabicNameField(): UntypedFormControl {
    return this.personalInfoTab.get('arName') as UntypedFormControl;
  }

  get englishNameField(): UntypedFormControl {
    return this.personalInfoTab.get('enName') as UntypedFormControl;
  }

  get beneficiaryRequesterNameField(): UntypedFormControl {
    return this.personalInfoTab.get('requestorName') as UntypedFormControl;
  }

  get employmentStatusField(): UntypedFormControl {
    return this.personalInfoTab.get('occuptionStatus') as UntypedFormControl;
  }

  get occupationField(): UntypedFormControl {
    return this.personalInfoTab.get('occuption') as UntypedFormControl;
  }

  get employerField(): UntypedFormControl {
    return this.personalInfoTab.get('employeer') as UntypedFormControl;
  }

  get workPlaceField(): UntypedFormControl {
    return this.personalInfoTab.get('employeerAddress') as UntypedFormControl;
  }

  get isHandicappedField(): UntypedFormControl {
    return this.personalInfoTab.get('isHandicapped') as UntypedFormControl;
  }

  get requestedAidField(): UntypedFormControl {
    return this.requestInfoTab.get('aidLookupId') as UntypedFormControl;
  }

  get allowCompletionField(): UntypedFormControl {
    return this.requestInfoTab.get('allowCompletion') as UntypedFormControl;
  }

  get allowDataSharingField(): UntypedFormControl {
    return this.requestInfoTab.get('allowDataSharing') as UntypedFormControl;
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
              this.editAidItem = undefined;
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

  private listenToAddAid() {
    this.addAid$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aidChanged$.next(new SubventionAid());
      });
  }

  private listenToReloadAids() {
    this.reloadAid$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init' && !!this.currentRequest && !!this.currentRequest.id),
      switchMap(() => {
        return this.subventionAidService.loadByCriteria({requestId: this.currentRequest!.id});
      })
    ).subscribe((result) => {
      this.subventionAidList = result;
      this.subventionAidDataSource.next(this.subventionAidList);
    });
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

  private loadDonors() {
    this.donorList = [];
    return this.donorService.loadAsLookups().pipe(
      catchError(() => of([]))
    ).subscribe((list) => {
      this.donorList = list;
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
      status: AidLookupStatusEnum.ACTIVE,
      parent: mainAidId
    }).pipe(
      catchError(() => of([]))
    );
  }

  aidsPeriodicTypeChange(value: number, _userInteraction: boolean = false) {
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
        this.requestStatusField?.updateValueAndValidity();
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

  private listenToRequestStatusChange(group: UntypedFormGroup) {
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
    return this.requestStatusArray.indexOf(this.requestStatusField.value) !== -1;
  }

  private validRequestStatus(): boolean {
    if (!this.requestStatusField) {
      return true;
    }
    return !(this.requestStatusField.value === SubventionRequestStatus.APPROVED && !this.subventionAidList.length);
  }

  private displayRequestStatusMessage(): void {
    this.dialogService.error(this.langService.map.msg_approved_request_without_one_aid_at_least);
  }

  private displayEmploymentStatusMessage(): void {
    this.dialogService.error(this.langService.map.msg_beneficiary_income_is_required);
  }

  private displayFamilyMemberCountMessage(): void {
    this.dialogService.error(this.langService.map.msg_family_member_list_count_dose_not_match_family_member_count);
  }

  private validateBeneficiaryNDAResponse(value: Pair<BeneficiarySaveStatus, Beneficiary> | null, ben: Beneficiary): 'STOP' | 'CONTINUE' {
    if (!value) {
      return 'CONTINUE';
    }
    let stopRequestStatus = [
      BeneficiarySaveStatus.NDA_ACTIVE_REQUESTS_EXISTING,
      BeneficiarySaveStatus.NDA_RECENT_AID_EXISTING,
      BeneficiarySaveStatus.NDA_RECENT_PERIODIC_AIDS_EXISTING,
      BeneficiarySaveStatus.BENEFICIARY_IS_DEAD
    ];
    if (stopRequestStatus.includes(value.first)) {
      this.dialogService.show(ConfirmNdaCasePopupComponent, {
        value, beneficiary: ben
      }).onAfterClose$.pipe(take(1))
        .subscribe((click: UserClickOn) => {
          if (!CommonUtils.isValidValue(click) || click === UserClickOn.CLOSE) {
            return;
          }
          if (click === UserClickOn.YES) {
            // continue
            this.validateBeneficiary = false;
            this.validateMophBeneficiary = false;
            this.save$.next(this.saveActions.skipValidateAndSave);
          } else if (click === UserClickOn.NO) {
            // clear
            if (this.currentParamType === this.routeParamTypes.normal) {
              this.beneficiaryChanged$.next(null);
              this.requestChanged$.next(null);

              this.form.markAsUntouched();
              this.form.markAsPristine();
            }
          }
        })
      return 'STOP';
    }
    return 'CONTINUE';
  }

  private validateBeneficiaryMOPHResponse(value: Pair<BeneficiarySaveStatus, Beneficiary> | null): 'STOP' | 'CONTINUE' {
    if (!value) {
      return 'STOP';
    }
    let status: 'STOP' | 'CONTINUE' = 'STOP';

    if (value.first === BeneficiarySaveStatus.BENEFICIARY_IS_DEAD_SERVICE_NOT_AVAILABLE) {
      status = 'STOP';
      const msg = this.langService.map[value.first as keyof ILanguageKeys] + '<br>' + this.langService.map.msg_confirm_continue;
      this.dialogService.confirm(msg, {
        actionBtn: 'btn_continue',
        cancelBtn: 'btn_clear',
        showCloseIcon: true
      }).onAfterClose$.pipe(take(1))
        .subscribe((click: UserClickOn) => {
          if (!CommonUtils.isValidValue(click) || click === UserClickOn.CLOSE) {
            return;
          }
          if (click === UserClickOn.YES) {
            // continue
            this.validateMophBeneficiary = false;
            this.save$.next(this.saveActions.validateAndSave);
          } else if (click === UserClickOn.NO) {
            // clear
            if (this.currentParamType === this.routeParamTypes.normal) {
              this.beneficiaryChanged$.next(null);
              this.requestChanged$.next(null);

              this.form.markAsUntouched();
              this.form.markAsPristine();
            }
          }
        });
    } else {
      status = 'CONTINUE';
    }

    return status;
  }

  private validateBeneficiaryExistenceResponse(value: Pair<BeneficiarySaveStatus, Beneficiary> | null): 'STOP' | 'CONTINUE' {
    if (!value) {
      return 'STOP';
    }
    let status: 'STOP' | 'CONTINUE' = 'STOP';
    if (value.first === BeneficiarySaveStatus.EXISTING) {
      status = 'STOP';
      let confirmMsg: DialogRef;
      if (this.empService.checkPermissions('SUBVENTION_AID_SEARCH')) {
        confirmMsg = this.dialogService.confirmWithTree(this.langService.map.beneficiary_already_exists, {
          actionBtn: 'btn_continue',
          thirdBtn: 'btn_save_and_inquire',
          cancelBtn: 'btn_clear',
          showCloseIcon: true
        });
      } else {
        confirmMsg = this.dialogService.confirm(this.langService.map.beneficiary_already_exists, {
          actionBtn: 'btn_continue',
          cancelBtn: 'btn_clear',
          showCloseIcon: true
        });
      }
      confirmMsg.onAfterClose$
        .pipe(take(1))
        .subscribe((click: UserClickOn) => {
          if (!CommonUtils.isValidValue(click) || click === UserClickOn.CLOSE) {
            return;
          }
          if (click === UserClickOn.YES) {
            // continue
            this.validateBeneficiary = false;
            this.validateMophBeneficiary = false;
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
            this.validateBeneficiary = false;
            this.validateMophBeneficiary = false;
            this.save$.next(this.saveActions.saveAndInquire);
          }
        });
    } else {
      status = 'CONTINUE';
    }

    return status;
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
    return this.secondaryIdTypeField?.value === optionValue;
  }

  isSecondaryIdTypeDisabled(optionValue: number): boolean {
    return this.primaryIdTypeField?.value === optionValue;
  }

  private _canShowNationalityField(idType: number) {
    return (idType === BeneficiaryIdTypes.PASSPORT || idType === BeneficiaryIdTypes.GCC_ID);
  }

  private _getIdTypeField(
    identification: 'primary' | 'secondary' | 'requester'
  ): UntypedFormControl {
    if (identification === 'primary') {
      return this.primaryIdTypeField;
    } else if (identification === 'secondary') {
      return this.secondaryIdTypeField;
    }
    return this.requesterIdTypeField;
  }

  isGCCId(identification: 'primary' | 'secondary' | 'requester'): boolean {
    const field = this._getIdTypeField(identification);
    return field && field.value === BeneficiaryIdTypes.GCC_ID;
  }

  private setNationalityVisibility(identification: 'primary' | 'secondary' | 'requester', idType: number): boolean {
    let visibility: boolean = this._canShowNationalityField(idType);

    if (identification === 'primary') {
      this.displayPrimaryNationality = visibility;
    } else if (identification === 'secondary') {
      this.displaySecondaryNationality = visibility;
    } else if (identification === 'requester') {
      this.displayRequesterNationality = visibility;
    }
    return visibility;
  }

  private static getNationalityByIdType(idType: number): string | number {
    if (!CommonUtils.isValidValue(idType)) {
      return '';
    }
    let nationalityValue: string | number = '';
    if (idType === BeneficiaryIdTypes.QID || idType === BeneficiaryIdTypes.VISA) {
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

        if (this._canShowNationalityField(value)) {
          nationalityValidators = [CustomValidators.required];
        }
      }

      this.primaryIdNumberField.setValue(null);
      this.primaryIdNumberField.setValidators(idValidators);
      this.primaryIdNumberField.updateValueAndValidity();

      this.primaryNationalityField.setValue(UserRequestComponent.getNationalityByIdType(value));
      this.primaryNationalityField.setValidators(nationalityValidators);
      this.primaryNationalityField.updateValueAndValidity();

      this.setNationalityVisibility('primary', value);
      if (this.isUserRequestPage && value === this.beneficiaryIdTypesEnum.QID) {
        this.expiryDateField.setValidators([CustomValidators.required]);
      } else {
        this.expiryDateField.clearValidators();
      }
    });
  }

  private listenToSecondaryIdTypeChange() {
    this.secondaryIdTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      let idValidators: any[] = [], nationalityValidators = null;

      if (CommonUtils.isValidValue(value)) {
        idValidators = [CustomValidators.required].concat(this.idTypesValidationsMap[value]);

        if (this._canShowNationalityField(value)) {
          nationalityValidators = [CustomValidators.required];
        }
      }

      this.secondaryIdNumberField.setValue(null);
      this.secondaryIdNumberField.setValidators(idValidators);
      this.secondaryIdNumberField.updateValueAndValidity();

      this.secondaryNationalityField.setValue(UserRequestComponent.getNationalityByIdType(value));
      this.secondaryNationalityField.setValidators(nationalityValidators);
      this.secondaryNationalityField.updateValueAndValidity();

      this.setNationalityVisibility('secondary', value);
    });
  }

  handleRequesterIdTypeChange(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.requesterIdNumberField.setValue(null);
      this.requesterNationalityField.setValue(UserRequestComponent.getNationalityByIdType(value));
    }

    this.setNationalityVisibility('requester', value);

    let idValidators: any[] = [], nationalityValidators = null;

    if (CommonUtils.isValidValue(value)) {
      idValidators = [CustomValidators.required].concat(this.idTypesValidationsMap[value]);

      if (this.displayRequesterNationality) {
        nationalityValidators = [CustomValidators.required];
      }
    }

    this.requesterIdNumberField.setValidators(idValidators);
    this.requesterIdNumberField.updateValueAndValidity();

    this.requesterNationalityField.setValidators(nationalityValidators);
    this.requesterNationalityField.updateValueAndValidity();
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

  requesterIdDisabled(_nationality: boolean = false): boolean {
    /*if (this.isPartialRequest) {
      return true;
    } else {
      if (nationality) {
        return this.readOnly;
      }
      return this.readOnly || this.editMode;
    }*/
    return (this.readOnly || this.isPartialRequest) || this.isRequesterSameAsBeneficiary();
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

  handleAllowDataSharingFieldChange($event?: any): void {
    if (!this.allowDataSharingField.value) {
      this.disclosureFile = undefined;
    }
    // $event = user interaction
    if ($event) {
      this.allowCompletionField.setValue(false);
    }

    this.toggleAllowCompletionReadonly();
  }

  setDisclosureFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.disclosureFile = file;
    } else {
      this.disclosureFile = file[0];
    }
  }

  private toggleAllowCompletionReadonly(): void {
    if (this.readOnly || !this.allowDataSharingField.value) {
      this.allowCompletionField?.disable();
    } else {
      if (this.currentRequest && !this.currentRequest.isUnderProcessing()) {
        this.allowCompletionField?.disable();
      } else {
        this.allowCompletionField?.enable();
      }
    }
  }

  private toggleIsHandicappedReadonly(): void {
    if (this.readOnly || this.isPartialRequest) {
      this.isHandicappedField?.disable();
    } else {
      this.isHandicappedField?.enable();
    }
  }

  private toggleRequesterRelationTypeReadonly(): void {
    if (this.readOnly || this.isPartialRequest) {
      this.requesterRelationTypeField?.disable();
    } else {
      this.requesterRelationTypeField?.enable();
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

  displayFormValidity(contentId: string = 'main-content'): void {
    CommonUtils.displayFormValidity(this.form, contentId);
    this.buildingPlate.displayFormValidity();
  }

  getTabInvalidStatus(tabName: string): boolean {
    let tab = this.tabsData[tabName];
    if (!tab) {
      console.info('tab not found: %s', tabName);
      return true; // if tab not found, consider it invalid
    }
    if (!tab.checkTouchedDirty) {
      return !tab.validStatus();
    }
    return !tab.validStatus() && tab.isTouchedOrDirty();
  }

  // noinspection JSUnusedLocalSymbols
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
