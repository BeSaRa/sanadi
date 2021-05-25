import {Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {DialogService} from '../../../services/dialog.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {BehaviorSubject, merge, of, Subject, Subscription} from 'rxjs';
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
import {BeneficiaryService} from '../../../services/beneficiary.service';
import {Beneficiary} from '../../../models/beneficiary';
import {ConfigurationService} from '../../../services/configuration.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {ToastService} from '../../../services/toast.service';
import {SubventionRequest} from '../../../models/subvention-request';
import {SubventionRequestService} from '../../../services/subvention-request.service';
import {SubventionAid} from '../../../models/subvention-aid';
import {AidLookupService} from '../../../services/aid-lookup.service';
import {AidLookup} from '../../../models/aid-lookup';
import {Lookup} from '../../../models/lookup';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {SubventionAidService} from '../../../services/subvention-aid.service';
import {StatusEnum} from '../../../enums/status.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {PeriodicPayment} from '../../../enums/periodic-payment.enum';
import {SubventionRequestStatus} from '../../../enums/subvention-request-status';
import {Pair} from '../../../interfaces/pair';
import {BeneficiarySaveStatus} from '../../../enums/beneficiary-save-status.enum';
import {formatDate} from '@angular/common';
import {ReadModeService} from '../../../services/read-mode.service';
import * as dayjs from 'dayjs';
import {IAngularMyDpOptions} from 'angular-mydatepicker';
import {isValidValue} from '../../../helpers/utils';
import {
  changeDateFromDatepicker,
  getDatepickerOptions,
  getDatePickerOptionsClone
} from '../../../helpers/utils-date';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {CanNavigateOptions} from '../../../types/types';
import {NavigationService} from '../../../services/navigation.service';
import {BeneficiaryIdTypes} from '../../../enums/beneficiary-id-types.enum';
import {SubventionResponseService} from '../../../services/subvention-response.service';
import {SubventionResponse} from '../../../models/subvention-response';
import {SanadiAttachment} from '../../../models/sanadi-attachment';
import {AttachmentService} from '../../../services/attachment.service';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit, OnDestroy {
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
  private currentBeneficiary?: Beneficiary;
  private currentAid?: SubventionAid;
  addAid$: Subject<any> = new Subject<any>();
  currentRequest?: SubventionRequest;
  subventionAid: SubventionAid[] = [];
  subventionAidDataSource: BehaviorSubject<SubventionAid[]> = new BehaviorSubject<SubventionAid[]>([]);
  attachmentList: SanadiAttachment[] = [];
  fm!: FormManager;
  form!: FormGroup;
  aidLookups: AidLookup[] = [];
  subAidLookupsArray: AidLookup[] = [];
  subAidLookup: Record<number, AidLookup> = {} as Record<number, AidLookup>;
  periodicityLookups: Record<number, Lookup> = {};
  hasEditAid = false;
  private editAidIndex: number = -1;
  editMode = false;
  aidColumns = [
    'approvalDate',
    'aidLookupId',
    'estimatedAmount',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'givenAmount',
    'remainingAmount',
    'actions'
  ];
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  /*dateConfig: IDatePickerDirectiveConfig = {
    format: this.configurationService.CONFIG.DATEPICKER_FORMAT,
    max: this.today
    // disableKeypress: true
  };
  dateConfigFuture: IDatePickerDirectiveConfig = {
    format: this.configurationService.CONFIG.DATEPICKER_FORMAT
  };*/

  datepickerOptionsMap: IKeyValue = {
    dateOfBirth: getDatepickerOptions({disablePeriod: 'future'}),
    dateOfBirthReadOnly: getDatepickerOptions({disablePeriod: 'future', readonly: true}),
    creationDate: getDatepickerOptions({disablePeriod: 'future'}),
    creationDateReadOnly: getDatepickerOptions({disablePeriod: 'future', readonly: true}),
    statusDateModified: getDatepickerOptions({disablePeriod: 'none'}),
    statusDateModifiedReadOnly: getDatepickerOptions({disablePeriod: 'none', readonly: true}),
    aidApprovalDate: getDatepickerOptions({disablePeriod: 'none'}),
    aidApprovalDateReadOnly: getDatepickerOptions({disablePeriod: 'none', readonly: true}),
    aidPaymentDate: getDatepickerOptions({disablePeriod: 'none'}),
    aidPaymentDateReadOnly: getDatepickerOptions({disablePeriod: 'none', readonly: true})
  };

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  private datepickerFieldPathMap: IKeyValue = {
    creationDate: 'requestInfoTab.creationDate',
    requestDate: 'requestInfoTab.creationDate',
    statusDate: 'requestStatusTab.statusDateModified',
    aidApprovalDate: 'aidTab.0.approvalDate',
    aidPaymentDate: 'aidTab.0.aidStartPayDate'
  };

  aidPeriodicTypeSub!: Subscription;
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

  tabsData: IKeyValue = {
    personal: {name: 'personalTab'},
    income: {name: 'incomeTab'},
    address: {name: 'addressTab'},
    requestInfo: {name: 'requestInfoTab'},
    requestStatus: {name: 'requestStatusTab'},
    aids: {name: 'aidsTab'},
    attachments: {name: 'attachmentsTab'}
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

  @ViewChild('creationDate') creationDateControlRef!: ElementRef;

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
              private renderer: Renderer2,
              private navigationService: NavigationService,
              private readModeService: ReadModeService,
              private attachmentService: AttachmentService, // to use in interceptor
              private fb: FormBuilder,
              private exceptionHandlerService: ExceptionHandlerService) {

  }

  get pageTitle(): string {
    return this.currentRequest?.id ?
      (this.langService.map.request_number + ' : ' + this.currentRequest.requestFullSerial) :
      this.langService.map.menu_provide_request;
  }

  ngOnInit(): void {
    this.buildForm();
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

    this.aidLookupService.loadByCriteria({status: StatusEnum.ACTIVE, aidType: 2})
      .pipe(take(1))
      .subscribe((lookups) => {
        this.aidLookups = lookups;
      });

    this.preparePeriodicityLookups();
    this.listenToRouteParams();
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

  private buildForm(beneficiary ?: Beneficiary, request?: SubventionRequest) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    request = request ? request : new SubventionRequest();
    this.form = this.fb.group({
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      incomeTab: this.fb.group(beneficiary.getEmployerFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group(request.getInfoFields(true)),
      requestStatusTab: this.editMode ? this.buildRequestStatusTab(request) : null,
      aidTab: this.fb.array([]),
      attachmentsTab: this.editMode ? this.fb.group([]) : null
    });
    this.fm = new FormManager(this.form, this.langService);
    this.listenToRequestDateChange();
  }

  private buildRequestStatusTab(request?: SubventionRequest): FormGroup {
    request = request ? request : new SubventionRequest();
    const group = this.fb.group(request.getStatusFields(true)) as FormGroup;
    this.listenToRequestStatusChange(group);
    return group;
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
      address?.reset();
      address?.markAsPristine();
    } else {
      personal?.patchValue(selectedBeneficiary.getPersonalFields());
      income?.patchValue(selectedBeneficiary.getEmployerFields());
      address?.patchValue(selectedBeneficiary.getAddressFields());
    }

  }

  private updateRequestForm(request: undefined | SubventionRequest) {
    const requestInfo = this.fm.getFormField('requestInfoTab');
    const requestStatus = this.fm.getFormField('requestStatusTab');
    if (!request) {
      requestInfo?.reset();
      requestStatus?.reset();
      this.readOnly = false;
    } else {
      requestStatus?.patchValue(request.getStatusFields());
      requestInfo?.patchValue(request.getInfoFields());

      if (request.isPartial) {
        this.fm.displayFormValidity();
      } else {
        if (request.id) {
          this.readOnly = this.readModeService.isReadOnly(request.id);
          if (this.readOnly){
            this.allowCompletionField?.disable();
          }
          this.fm.displayFormValidity();
        } else {
          this.readOnly = false;
        }
      }
    }
  }

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
    ).subscribe((value) => {
      if (this.primaryIdTypeField?.value === this.idMap.passport && isValidValue(this.primaryNationalityField?.value)) {
        this.benNationalityField?.setValue(this.primaryNationalityField?.value);
        this.benNationalityField?.updateValueAndValidity();
      }
    });

    this.secondaryNationalityField?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      if (this.secondaryIdTypeField?.value === this.idMap.passport && isValidValue(this.secondaryNationalityField?.value)) {
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
      map(() => this.fm.getForm()?.valid)
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
            aidList: this.subventionAid,
            attachmentList: this.attachmentList
          });
          return this.subventionResponseService.savePartialRequest(data)
            .pipe(catchError(() => {
              console.log('save Partial Request Failed');
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
      this.router.navigate(['/home/main/request/', response.request.id]).then();
    });

    // if we have invalid forms display dialog to tell the user that is something wrong happened.
    invalidFormPartial$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkFormFieldsCallback();
      });
  }

  private listenToSaveModel() {

    const formAidValid$ = this.save$
      .pipe(
        tap(val => console.log(val)),
        tap(_ => !this.validRequestStatus() ? this.displayRequestStatusMessage() : null),
        filter(_ => this.validRequestStatus()),
        share()
      );


    // map formStatus
    const formStatus$ = formAidValid$.pipe(
      map(() => this.fm.getForm()?.valid)
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
          return request.save().pipe(catchError(() => {
            console.log('save Request Failed');
            return of(null);
          }));
        })
      ).subscribe((request) => {
      if (!request) {
        return;
      }

      if (this.editMode) {
        this.dialogService.success(this.langService.map.msg_request_has_been_updated_successfully);
      } else {
        this.dialogService.success(this.langService.map.msg_request_has_been_added_successfully.change({serial: request.requestFullSerial}));
      }
      this.currentRequest = request.clone();
      this.editMode = true;

      if (!this.currentRequest.isUnderProcessing()) {
        this.allowCompletionField?.disable();
      }

      if (!this.requestStatusTab.value) {
        this.form.setControl('requestStatusTab', this.buildRequestStatusTab(this.currentRequest));
      }
      this.form.markAsPristine({onlySelf: true});
    });

    // if we have invalid forms display dialog to tell the user that is something wrong happened.
    invalidForm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkFormFieldsCallback();
      });
  }

  private checkFormFieldsCallback() {
    this.dialogService.error(this.langService.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(take(1))
      .subscribe(() => {
        this.fm.displayFormValidity();
      });
  }

  private prepareBeneficiary(): Beneficiary {
    const personal = this.fm.getFormField('personalTab')?.value;
    const income = this.fm.getFormField('incomeTab')?.value;
    const address = this.fm.getFormField('addressTab')?.value;
    return this.currentBeneficiary = (new Beneficiary())
      .clone({...this.currentBeneficiary, ...personal, ...income, ...address});
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
          tap(val => {
            this.currentParamType = this.routeParamTypes.normal;
          })
        ),
      partialRequestId$ = this.activeRoute.params
        .pipe(
          filter(params => params.hasOwnProperty('partial-id')),
          pluck('partial-id'),
          tap(val => {
            this.currentParamType = this.routeParamTypes.partial;
          })
        );

    merge(requestId$, partialRequestId$)
      .pipe(
        switchMap((requestId: number) => {
          if (this.currentParamType === this.routeParamTypes.normal) {
            return this.subventionResponseService.loadById(requestId);
          } else if (this.currentParamType === this.routeParamTypes.partial) {
            return this.subventionResponseService.createPartialRequestById(requestId)
              .pipe(
                catchError((err) => {
                  this.currentParamType = this.routeParamTypes.normal;
                  this.exceptionHandlerService.handle(err);
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
        this.subventionAid = response.aidList;
        this.subventionAidDataSource.next(this.subventionAid);
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
        this.loadSubAidCategory().subscribe();
      });
  }

  saveModel() {
    if (this.currentParamType === this.routeParamTypes.partial) {
      this.savePartial$.next(null);
    } else {
      this.save$.next(null);
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
    this.editAidIndex = -1;
    this.hasEditAid = false;
  }

  private preparePeriodicityLookups(): void {
    this.periodicityLookups = this.lookup.listByCategory.SubAidPeriodicType.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, {} as Record<number, Lookup>);
  }

  private prepareLookupAid(): void {
    this.subAidLookup = this.subAidLookupsArray.reduce((acc, item) => {
      return {...acc, [item.id]: item};
    }, this.subAidLookup);
  }

  private resetAid() {
    const aidArray = this.fm.getFormField('aidTab') as FormArray;
    aidArray.clear();
    aidArray.markAsUntouched();
    aidArray.markAsPristine();
  }

  private validateAidAmount(): 'VALID' | 'INVALID_ONE_TIME' | 'INVALID_MONTHLY' {
    const aidPeriodicType = this.aidPeriodicType?.value,
      givenAmount = this.aidGivenAmountField?.value,
      estimatedAmount = this.aidEstimatedAmountField?.value,
      numberOfInstallments = this.aidInstallmentsCount?.value,
      subAidPeriodicType = {
        monthly: 1,
        oneTime: 2
      };
    if (aidPeriodicType === subAidPeriodicType.oneTime && (Number(givenAmount) > Number(estimatedAmount))) {
      return 'INVALID_ONE_TIME';
    } else if (aidPeriodicType === subAidPeriodicType.monthly && (Number(givenAmount) * Number(numberOfInstallments)) > Number(estimatedAmount)) {
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
    let parentValue = 0;
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.langService.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.fm.getFormField('aidTab')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return this.fm.getFormField('aidTab.0') as FormArray;
      }),
      map((form) => {
        parentValue = form.value.mainAidType;
        return (new SubventionAid()).clone({
          ...this.currentAid, ...form.getRawValue(),
          subventionRequestId: this.currentRequest?.id
        });
      }),
      exhaustMap((aid) => {
        if (!this.currentRequest || !this.currentRequest.id) {
          return of(aid);
        }
        return aid
          .save()
          .pipe(catchError(() => of(null)));
      })
    ).subscribe((subventionAid) => {
      if (!subventionAid) {
        return;
      }

      let message: string;
      if (!this.hasEditAid) {
        this.subventionAid.push(subventionAid.clone({
          aidLookupInfo: {parent: parentValue}
        }));
        message = this.langService.map.msg_aid_added_successfully;
      } else {
        this.subventionAid.splice(this.editAidIndex, 1, subventionAid);
        this.hasEditAid = false;
        this.editAidIndex = -1;
        message = this.langService.map.msg_aid_updated_successfully;
      }
      this.toastService.success(message);
      this.subventionAid = this.subventionAid.slice();
      this.subventionAidDataSource.next(this.subventionAid);
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
    const approvedDateValue = changeDateFromDatepicker(this.aidApprovalDate?.value);

    // let creationDate = this.fm.getFormField('requestInfoTab.creationDate');
    let minDate = changeDateFromDatepicker(this.creationDateField?.value);
    if (minDate) {
      minDate.setHours(0, 0, 0, 0);
    }
    let minFieldName = 'creationDate';

    if (approvedDateValue) {
      if (dayjs(approvedDateValue).isAfter(dayjs(minDate))) {
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
    const aidArray = this.fm.getFormField('aidTab') as FormArray;
    aidArray.clear();

    if (aid) {
      aidArray.push(this.fb.group(aid.getAidFields(true)));
      this.loadSubAidCategory().subscribe();
      this.aidPeriodicTypeSub = this.aidPeriodicType
        .valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.periodicChange(value);
        });
      this.aidPeriodicType.updateValueAndValidity();

      // const requestCreationDate = this.fm.getFormField('requestInfoTab.creationDate');
      const requestCreationDateValue = changeDateFromDatepicker(this.creationDateField?.value);
      if (this.creationDateField && requestCreationDateValue) {
        this.setRelatedMinDate('creationDate', 'aidApprovalDate');
        this.aidApprovalDate?.setValidators([CustomValidators.required, CustomValidators.minDate(requestCreationDateValue)]);
      }

      this._setPaymentDateValidations();

      this.aidApprovalDateSub = this.aidApprovalDate?.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(value => {
        this._setPaymentDateValidations();
      });
    } else {
      this.aidPeriodicTypeSub?.unsubscribe();
      this.aidApprovalDateSub?.unsubscribe();
    }
  }

  get aidFormArray(): FormArray {
    return this.fm.getFormField('aidTab') as FormArray;
  }

  get requestStatusTab(): FormGroup {
    return this.fm.getFormField('requestStatusTab') as FormGroup;
  }

  get creationDateField(): FormControl {
    return this.fm.getFormField('requestInfoTab.creationDate') as FormControl;
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

  deleteAid(subventionAid: SubventionAid, index: number, $event: MouseEvent): any {
    $event.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          subventionAid.delete()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.subventionAid.splice(index, 1);
              this.toastService.success(this.langService.map.msg_delete_success);
              if (!this.subventionAid.length) {
                this.aidChanged$.next(new SubventionAid());
              }
              this.subventionAidDataSource.next(this.subventionAid);
            });
        }
      });
  }

  editAid(row: SubventionAid, index: number, $event: MouseEvent) {
    $event.preventDefault();
    this.hasEditAid = true;
    this.editAidIndex = index;
    this.aidChanged$.next(row);
  }

  getLookup(lookupKey: number): Lookup {
    return this.periodicityLookups[lookupKey];
  }

  getAidLookup(id: number): AidLookup {
    return this.subAidLookup[id];
  }

  private listenToAddAid() {
    this.addAid$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.aidChanged$.next(new SubventionAid());
      });
  }

  private loadSubAidCategory() {
    // thanks to khaled he saved my life here for ever thanks again.
    this.subAidLookupsArray = [];
    return this.aidLookupService
      .loadByCriteria({
        aidType: 3,
        status: StatusEnum.ACTIVE
      })
      .pipe(
        take(1),
        tap(list => {
          this.subAidLookupsArray = list;
          this.prepareLookupAid();
        })
      );
  }

  periodicChange(value: number) {
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
        const requestDate = changeDateFromDatepicker(value);
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
        if (this.requestStatusArray.indexOf(newValue) !== -1 && this.subventionAid.length) {
          this.dialogService.error(this.langService.map.remove_provided_aid_first_to_change_request_status);
          group.get('status')?.setValue(oldValue);
        }
        this.setRelatedMinDate('creationDate', 'statusDateModified');
        // const requestInfoRequestDate = this.fm.getFormField('requestInfoTab.creationDate');
        let creationDate = changeDateFromDatepicker(this.creationDateField?.value);
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
    return !(status.value === SubventionRequestStatus.APPROVED && !this.subventionAid.length);
  }

  private displayRequestStatusMessage(): void {
    this.dialogService.error(this.langService.map.msg_approved_request_without_one_aid_at_least);
  }

  private displayBeneficiaryExistsMessage(value: Pair<BeneficiarySaveStatus, Beneficiary> | null): any {
    if (!value) {
      return;
    }

    if (value.first === BeneficiarySaveStatus.EXISTING) {
      this.dialogService.confirmWithTree(this.langService.map.beneficiary_already_exists, {
        actionBtn: 'btn_continue',
        thirdBtn: 'btn_inquire',
        cancelBtn: 'btn_cancel'
      })
        .onAfterClose$
        .pipe(take(1))
        .subscribe((click: UserClickOn) => {
          if (click === UserClickOn.YES) {
            this.validateStatus = false;
            this.save$.next();
          } else if (click === UserClickOn.NO) {
            if (this.currentParamType === this.routeParamTypes.normal) {
              this.beneficiaryChanged$.next(null);
              this.requestChanged$.next(null);

              this.form.markAsUntouched();
              this.form.markAsPristine();
            }
          } else {
            const ben = this.prepareBeneficiary();
            this.router.navigate(['/home/main/inquiry', {
              idNumber: ben.benPrimaryIdNumber,
              idType: ben.benPrimaryIdType,
              nationality: ben.benPrimaryIdNationality
            }]).then();
          }
        });
    }
  }

  setRelatedMinDate(fromFieldName: string, toFieldName: string, disableSameDate: boolean = false): void {
    setTimeout(() => {
      let toFieldDateOptions: IAngularMyDpOptions = getDatePickerOptionsClone(this.datepickerOptionsMap[toFieldName]);
      const fromDate = changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[fromFieldName])?.value);
      if (!fromDate) {
        toFieldDateOptions.disableUntil = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(fromDate);
        disableDate.setHours(0, 0, 0, 0); // set fromDate to start of day
        if (!disableSameDate) {
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

  isPrimaryIdTypeDisabled(optionValue: number): boolean {
    return this.fm.getFormField('personalTab.benSecIdType')?.value === optionValue;
  }

  isSecondaryIdTypeDisabled(optionValue: number): boolean {
    return this.fm.getFormField('personalTab.benPrimaryIdType')?.value === optionValue;
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

  private setNationalityVisibility(identification: string, idType: number): boolean {
    if (!isValidValue(idType)) {
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
    if (!isValidValue(idType)) {
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

      if (isValidValue(value)) {
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

      if (isValidValue(value)) {
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

  beneficiaryPrimaryIdDisabled(): boolean {
    return this.isPartialRequest || this.readOnly || this.editMode;
  }

  beneficiarySecondaryIdDisabled(): boolean {
    if (this.readOnly) {
      return true;
    } else if (!this.editMode) {
      return false;
    } else {
      return !!this.currentBeneficiary?.benSecIdType && !!this.currentBeneficiary?.benSecIdNumber;
    }
  }

  get allowCompletionField(): FormControl {
    return this.fm.getFormField('requestInfoTab.allowCompletion') as FormControl;
  }

  get isCurrentRequestPartial(): boolean {
    return !this.currentRequest ? false : this.currentRequest.isPartial;
  }

  setButtonsVisibility(tab: any): void {
    /*const tabsNotToShowSave = [this.tabsData.aids.name, this.tabsData.attachments.name];
    const tabsNotToShowValidate = [this.tabsData.aids.name, this.tabsData.attachments.name];
    this.saveVisible = !tab.name || (tabsNotToShowSave.indexOf(tab.name) === -1);
    this.validateFieldsVisible = !tab.name || (tabsNotToShowValidate.indexOf(tab.name) === -1);*/
  }

  updateAttachmentList(attachments: SanadiAttachment[]): void {
    this.attachmentList = [];
    this.attachmentList = attachments;
  }

  toggleElementDisabled(elementRef: ElementRef, setDisabled: boolean): void {
    if (setDisabled) {
      this.renderer.setAttribute(elementRef.nativeElement, 'disabled', 'disabled');
    } else {
      this.renderer.removeAttribute(elementRef.nativeElement, 'disabled');
      this.renderer.removeClass(elementRef.nativeElement, 'disabled');
      this.renderer.removeClass(elementRef.nativeElement, ':disabled');
    }
  }

  saveButtonEnabled(): boolean {
    if (this.isPartialRequest) {
      return this.form.valid;
    } else {
      if (this.readOnly) {
        return false;
      }
      return this.form.valid;
    }
  }

  /**
   * @description Check if user can navigate to other pages
   */
  canDeactivate(): CanNavigateOptions {
    if (!this.form.dirty) {
      return 'ALLOW';
    }
    return 'CONFIRM_UNSAVED_CHANGES';
  }
}
