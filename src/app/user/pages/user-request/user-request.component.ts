import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {DialogService} from '../../../services/dialog.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {of, Subject, Subscription} from 'rxjs';
import {
  catchError,
  concatMap,
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
import {IDatePickerDirectiveConfig} from 'ng2-date-picker';
import {ActivatedRoute, Router} from '@angular/router';
import {PeriodicPayment} from '../../../enums/periodic-payment.enum';
import {SubventionRequestStatus} from '../../../enums/subvention-request-status';
import {Pair} from '../../../interfaces/pair';
import {BeneficiarySaveStatus} from '../../../enums/beneficiary-save-status.enum';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrls: ['./user-request.component.scss']
})
export class UserRequestComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();
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
  fm!: FormManager;
  form!: FormGroup;
  idNumbersChanges$: Subject<{ field: string, value: string }> = new Subject<{ field: string, value: string }>();
  idFieldsClearButtons: { [index: string]: boolean } = {
    qid: false,
    visa: false,
    passport: false,
    gccId: false
  };
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
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'aidAmount',
    'actions'
  ];
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  dateConfig: IDatePickerDirectiveConfig = {
    format: this.configurationService.CONFIG.DATEPICKER_FORMAT,
    max: this.today
    // disableKeypress: true
  };
  dateConfigFuture: IDatePickerDirectiveConfig = {
    format: this.configurationService.CONFIG.DATEPICKER_FORMAT
  };
  aidPeriodicTypeSub!: Subscription;

  private requestStatusArray: SubventionRequestStatus[] = [SubventionRequestStatus.REJECTED, SubventionRequestStatus.SAVED];
  private validateStatus: boolean = true;

  constructor(public langService: LangService,
              public lookup: LookupService,
              private beneficiaryService: BeneficiaryService,
              private dialogService: DialogService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private subventionRequestService: SubventionRequestService,
              private subventionAidService: SubventionAidService,
              private aidLookupService: AidLookupService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) {

  }


  private buildForm(beneficiary ?: Beneficiary, request?: SubventionRequest) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    request = request ? request : new SubventionRequest();
    this.form = this.fb.group({
      idTypes: this.fb.group({
        passport: [null, [CustomValidators.pattern('PASSPORT')]],
        visa: [null, [CustomValidators.number]],
        qid: [null, [CustomValidators.number,
          CustomValidators.minLength(CustomValidators.defaultLengths.QID_MIN),
          CustomValidators.maxLength(CustomValidators.defaultLengths.QID_MAX)
        ]],
        gccId: [null, [CustomValidators.number]]
      }, {validators: CustomValidators.anyFieldsHasLength(['visa', 'qid', 'gccId'])}),
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      incomeTab: this.fb.group(beneficiary.getEmployerFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group(request.getInfoFields(true)),
      requestStatusTab: this.editMode ? this.buildRequestStatusTab(request) : null,
      aidTab: this.fb.array([]),
    });
    this.fm = new FormManager(this.form, this.langService);
  }

  private buildRequestStatusTab(request?: SubventionRequest): FormGroup {
    request = request ? request : new SubventionRequest();
    const group = this.fb.group(request.getStatusFields(true)) as FormGroup;
    this.listenToRequestStatusChange(group);
    return group;
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
      const fieldPath = 'idTypes.' + field;
      field !== fieldName ? this.fm.getFormField(fieldPath)?.disable() : this.fm.getFormField(fieldPath)?.enable();
      field !== fieldName ? this.idFieldsClearButtons[field] = false : this.idFieldsClearButtons[field] = true;
    });
  }

  private enableAllIdFields(): void {
    ['qid', 'visa', 'gccId'].forEach(field => {
      const fieldPath = 'idTypes.' + field;
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
          this.currentBeneficiary = beneficiary;
          this.updateIdsForms('passport', beneficiary.benSecIdNumber);
          for (const key in this.idMap) {
            if (this.idMap[key] === beneficiary.benPrimaryIdType) {
              this.updateIdsForms('passport', beneficiary.benSecIdNumber);
              this.updateIdsForms(key, beneficiary.benPrimaryIdNumber);
            }
          }
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
    } else {
      requestStatus?.patchValue(request.getStatusFields());
      requestInfo?.patchValue(request.getInfoFields());
    }
  }

  private updateIdsForms(key: string, value: string) {
    const field = `idTypes.${key}`, control = this.fm.getFormField(field);
    if (key !== 'passport') {
      this.disableOtherIdFieldsExcept(key);
    }
    control?.setValue(value);
    control?.updateValueAndValidity();
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
          control?.setValidators(required ? [CustomValidators.required, CustomValidators.number, Validators.min(0)] : null);
          control?.updateValueAndValidity();
        });
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
          return beneficiary.saveWithValidate(this.validateStatus).pipe(catchError(() => {
            return of(null);
          }));
        }),
        tap((value) => this.displayBeneficiaryExistsMessage(value)),
        map(value => {
          return value?.second;
        }),
        filter(value => !!value)
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
      this.disableOtherIdFieldsExcept('none');
      if (!this.requestStatusTab.value) {
        this.form.setControl('requestStatusTab', this.buildRequestStatusTab(this.currentRequest));
      }
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

  get pageTitle(): string {
    return this.currentRequest?.id ?
      (this.langService.map.request_number + ' : ' + this.currentRequest.requestFullSerial) :
      this.langService.map.menu_provide_request;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToIdNumberChange();
    this.listenToBeneficiaryChange();
    this.listenToRequestChange();
    this.listenToOccupationStatus();
    this.listenToAidChange();
    this.listenToExtraIncome();
    this.listenToSaveModel();
    this.listenToSaveAid();
    this.listenToAddAid();
    this.listenToNationalityChange();

    this.aidLookupService.loadByCriteria({status: StatusEnum.ACTIVE, aidType: 2})
      .pipe(take(1))
      .subscribe((lookups) => {
        this.aidLookups = lookups;
      });

    this.preparePeriodicityLookups();
    this.listenToRouteParams();
  }

  private listenToRouteParams() {
    let request: SubventionRequest, beneficiary: Beneficiary, aid: SubventionAid[];
    const request$ = this.activeRoute
      .params
      .pipe(
        filter(params => params.hasOwnProperty('id')),
        pluck('id'),
        switchMap((requestId: number) => {
          return this.subventionRequestService.getById(requestId);
        }),
        tap(myRequest => request = myRequest)
      );

    const beneficiary$ = request$.pipe(
      pluck('benId'),
      switchMap((id: number) => {
        return this.beneficiaryService.getById(id);
      }),
      tap(myBeneficiary => beneficiary = myBeneficiary),
    );

    beneficiary$.pipe(
      switchMap(() => {
        return request.loadRequestAids();
      }),
      tap(myAid => aid = myAid),
      concatMap(() => {
        return this.loadSubAidCategory().pipe(catchError(() => {
          return of([]);
        }));
      }),
    ).subscribe((_) => {
      this.beneficiaryChanged$.next(beneficiary);
      this.subventionAid = aid;
      this.form.setControl('requestStatusTab', this.buildRequestStatusTab(request));
      this.requestChanged$.next(request);
      this.editMode = true;
      this.disableOtherIdFieldsExcept('none');
    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  saveModel() {
    this.save$.next(null);
  }

  getBeneficiaryData(fieldName: string, $event?: Event) {
    $event?.preventDefault();
    const primaryNumber = this.fm.getFormField('personalTab.benPrimaryIdNumber')?.value;
    const secondary = this.fm.getFormField('personalTab.benSecIdNumber')?.value;
    const nationality = this.fm.getFormField('personalTab.benNationality')?.value;

    if (fieldName === 'passport' && !nationality) {
      this.dialogService.info(this.langService.map.msg_select_nationality);
      return;
    }

    this.beneficiaryService
      .loadByCriteria({
        benPrimaryIdNumber: primaryNumber ? primaryNumber : undefined,
        benPrimaryIdType: primaryNumber ? this.idMap[fieldName] : undefined,
        benSecIdNumber: secondary ? secondary : undefined,
        benSecIdType: secondary ? this.idMap['passport'] : undefined,
        benSecIdNationality: secondary ? nationality : undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        if (!list.length) {
          return this.beneficiaryChanged$.next(null);
        }
        list.length > 1 ? this.beneficiaryService.openSelectBeneficiaryDialog(list).onAfterClose$.subscribe((beneficiary) => {
          if (beneficiary instanceof Beneficiary) {
            this.beneficiaryChanged$.next(beneficiary);
          }
        }) : this.beneficiaryChanged$.next(list[0]);
      });
  }

  clearField(fieldName: string) {
    const field = this.fm.getFormField(`idTypes.${fieldName}`);
    const passport = this.fm.getFormField(`idTypes.passport`);
    field?.patchValue(null);
    passport?.patchValue(null);
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
      event.stopPropagation();
      return;
    }
    this.idNumbersChanges$.next({
      field: element.id,
      value: (element.value + '').trim()
    });
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

  private listenToSaveAid() {
    const aidForm$ = this.saveAid$.pipe(map(() => {
      return this.fm.getFormField('aidTab.0') as AbstractControl;
    }));

    const validForm$ = aidForm$.pipe(filter((form) => form.valid));
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
        return this.fm.getFormField('aidTab.0') as AbstractControl;
      }),
      map((form) => {
        parentValue = form.value.mainAidType;
        return (new SubventionAid()).clone({
          ...this.currentAid, ...form.value,
          subventionRequestId: this.currentRequest?.id
        });
      }),
      exhaustMap((aid) => {
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
    } else {
      this.aidPeriodicTypeSub?.unsubscribe();
    }
  }

  get aidFormArray(): FormArray {
    return this.fm.getFormField('aidTab') as FormArray;
  }

  get aidLookupIdField(): FormControl {
    return this.form.get('aidTab.0.aidLookupId') as FormControl;
  }

  get requestStatusTab(): FormGroup {
    return this.fm.getFormField('requestStatusTab') as FormGroup;
  }

  get aidInstallmentsCount(): FormControl {
    return this.fm.getFormField('aidTab.0.installementsCount') as FormControl;
  }

  get aidPeriodicType(): FormControl {
    return this.aidFormArray.get('0.periodicType') as FormControl;
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
            });
        }
      });
  }

  editAid(row: SubventionAid, index: number, $event: MouseEvent) {
    $event.preventDefault();
    this.aidChanged$.next(row);
    this.hasEditAid = true;
    this.editAidIndex = index;
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
      this.aidInstallmentsCount?.setValidators([CustomValidators.required, CustomValidators.number]);
      this.aidInstallmentsCount.enable();
    } else {
      this.aidInstallmentsCount.setValidators(CustomValidators.number);
      this.aidInstallmentsCount.setValue(0);
      this.aidInstallmentsCount.disable();
    }
    this.aidInstallmentsCount.updateValueAndValidity();
  }

  cancelRequest(): any {
    return this.router.navigate(['.']);
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
        const requestInfoRequestDate = this.fm.getFormField('requestInfoTab.creationDate');

        if (newValue === SubventionRequestStatus.APPROVED) {
          group.get('statusDateModified')?.setValidators([CustomValidators.required, CustomValidators.minDate(requestInfoRequestDate?.value)]);
        } else {
          group.get('statusDateModified')?.setValidators(null);
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
            this.beneficiaryChanged$.next(null);
            this.requestChanged$.next(null);
          } else {
            const ben = this.prepareBeneficiary();
            this.router.navigate(['/home/user/inquiry', {
              idNumber: ben.benPrimaryIdNumber,
              idType: ben.benPrimaryIdType
            }]).then();
          }
        });
    }
  }
}
