import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {DialogService} from '../../../services/dialog.service';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {catchError, distinctUntilChanged, exhaustMap, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
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
    gccId: 3,
    visa: 6,
    passport: 5,
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
  subAidLookup: Record<number, AidLookup> = {};
  // static value for now till we finish the authentication
  currentUser = {orgBranchId: 1, orgId: 1, orgUserId: 1};
  periodicityLookups: Record<number, Lookup> = {};
  hasEditAid = false;
  private editAidIndex: number = -1;

  aidColumns = [
    'approvalDate',
    'aidLookupId',
    'periodicType',
    'installementsCount',
    'aidStartPayDate',
    'aidAmount',
    'actions'
  ];

  constructor(public langService: LangService,
              public lookup: LookupService,
              private beneficiaryService: BeneficiaryService,
              private dialogService: DialogService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private subventionRequestService: SubventionRequestService,
              private subventionAidService: SubventionAidService,
              private aidLookupService: AidLookupService,
              private fb: FormBuilder) {

  }


  private buildForm(beneficiary ?: Beneficiary, request?: SubventionRequest) {
    beneficiary = beneficiary ? beneficiary : new Beneficiary();
    request = request ? request : new SubventionRequest();
    this.form = this.fb.group({
      idTypes: this.fb.group({
        passport: [],
        visa: [],
        qid: [],
        gccId: []
      }),
      personalTab: this.fb.group(beneficiary.getPersonalFields(true)),
      incomeTab: this.fb.group(beneficiary.getEmployerFields(true)),
      addressTab: this.fb.group(beneficiary.getAddressFields(true)),
      requestInfoTab: this.fb.group(request.getInfoFields(true)),
      requestStatusTab: this.fb.group(request.getStatusFields(true)),
      aidTab: this.fb.array([]),
    });
    this.fm = new FormManager(this.form, this.langService);
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
      const fieldPath = `idTypes.${field}`;
      field !== fieldName ? this.fm.getFormField(fieldPath)?.disable() : this.fm.getFormField(fieldPath)?.enable();
      field !== fieldName ? this.idFieldsClearButtons[field] = false : this.idFieldsClearButtons[field] = true;
    });
  }

  private enableAllIdFields(): void {
    ['qid', 'visa', 'gccId'].forEach(field => {
      const fieldPath = `idTypes.${field}`;
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
      income?.reset();
      address?.reset();
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
          control?.setValidators(required ? CustomValidators.required : null);
          control?.updateValueAndValidity();
        });
      });
  }

  private listenToExtraIncome() {
    this.fm.getFormField('incomeTab.benExtraIncome')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      map(value => Number(value))
    ).subscribe((value) => {
      const control = this.fm.getFormField('incomeTab.benExtraIncomeSource');
      value ? control?.setValidators(CustomValidators.required) : null;
      control?.updateValueAndValidity();
    });
  }

  private listenToSaveModel() {
    // map formStatus
    const formStatus$ = this.save$
      .pipe(
        takeUntil(this.destroy$),
        map(() => this.fm.getForm()?.valid)
      );
    // filter invalidForm stream
    const invalidForm$ = formStatus$.pipe(
      takeUntil(this.destroy$),
      filter(value => {
        return value === false;
      })
    );
    // filter valid form stream
    const validForm$ = formStatus$.pipe(
      takeUntil(this.destroy$),
      filter(value => {
        return value === true;
      })
    );
    // prepare the beneficiary/request Models.
    const requestWithBeneficiary$ = validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return {
          beneficiary: this.prepareBeneficiary(),
          request: this.prepareRequest(),
        };
      })
    );
    // save beneficiary with request
    requestWithBeneficiary$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((value) => {
        return value.beneficiary.save()
          .pipe(
            tap((beneficiary) => {
              this.currentBeneficiary = beneficiary.clone();
            }),
            catchError(() => {
              return of(null);
            }),
            switchMap((bene) => {
              if (!(bene instanceof Beneficiary)) {
                return of(null);
              }
              value.request.benId = bene.id;
              return value.request.save().pipe(
                catchError(() => {
                  return of(null);
                }),
                tap((request) => {
                  this.currentRequest = request?.clone();
                })
              );
            })
          );
      }))
      .subscribe((request) => {
        if (!request) {
          return;
        }
        const aidList: Observable<SubventionAid>[] = [];
        this.subventionAid.forEach(item => {
          item.subventionRequestId = request.id;
          aidList.push(item.save());
        });
        combineLatest(aidList).pipe(takeUntil(this.destroy$)).subscribe((list) => {
          console.log(list);
          this.toastService.success(this.langService.map.msg_request_has_been_added_successfully);
        });
      });
    // if we have invalid forms display dialog to tell the user that is something wrong happened.
    invalidForm$.subscribe(() => {
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
      .clone({...this.currentBeneficiary, ...personal, ...income, ...address, ...this.currentUser});
  }

  private prepareRequest(): SubventionRequest {
    const request = {
      ...this.currentRequest,
      ...this.fm.getFormField('requestInfoTab')?.value,
      ...this.fm.getFormField('requestStatusTab')?.value,
      ...this.currentUser,
      requestChannel: 1 // SANADI PORTAL
    };
    return this.currentRequest = (new SubventionRequest()).clone(request);
  }

  get pageTitle(): string {
    return this.currentRequest?.id ?
      (this.langService.map.request_number + '' + this.currentRequest.requestFullSerial) :
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

    this.aidLookupService.loadByCriteria({status: StatusEnum.ACTIVE, aidType: 2})
      .pipe(take(1))
      .subscribe((lookups) => {
        this.aidLookups = lookups;
      });

    this.periodicityLookups = this.lookup.listByCategory.SubAidPeriodicType.reduce((acc, item) => {
      return {...acc, [item.lookupKey]: item};
    }, {} as Record<number, Lookup>);

    // just start display the form for the first time if there is no aid list.
    if (!this.subventionAid.length) {
      this.aidChanged$.next(new SubventionAid());
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  saveModel() {
    this.save$.next(null);
  }

  getBeneficiaryData(fieldName: string) {
    const primaryNumber = this.fm.getFormField('personalTab.benPrimaryIdNumber')?.value;
    const secondary = this.fm.getFormField('personalTab.benSecIdNumber')?.value;

    this.beneficiaryService
      .loadByCriteria({
        benPrimaryIdNumber: primaryNumber ? primaryNumber : undefined,
        benPrimaryIdType: primaryNumber ? this.idMap[fieldName] : undefined,
        benSecIdNumber: secondary ? secondary : undefined,
        benSecIdType: secondary ? this.idMap['passport'] : undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        if (!list.length) {
          return this.beneficiaryChanged$.next(null);
        }
        list.length > 1 ? this.beneficiaryService.openSelectBeneficiaryDialog(list) : this.beneficiaryChanged$.next(list[0]);
      });
  }

  clearField(fieldName: string) {
    const field = this.fm.getFormField(`idTypes.${fieldName}`);
    field?.patchValue(null);
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
      event.stopImmediatePropagation();
      this.getBeneficiaryData(element.id);
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
        return (new SubventionAid()).clone({...this.currentAid, ...form.value, ...this.currentUser});
      }))
      .subscribe((subventionAid) => {
        if (!this.hasEditAid) {
          this.subventionAid.push(subventionAid);
        } else {
          this.subventionAid.splice(this.editAidIndex, 1, subventionAid);
        }
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
    }
    aidArray.markAsUntouched();
    aidArray.markAsPristine();
  }

  get aidFormArray(): FormArray {
    return this.fm.getFormField('aidTab') as FormArray;
  }

  mainAidChanged(value: string) {
    this.aidLookupService.loadByCriteria({
      aidType: 3,
      status: true,
      parent: Number(value)
    }).subscribe((result) => {
      this.subAidLookupsArray = result;
      this.subAidLookup = result.reduce((acc, item) => {
        return {...acc, [item.id]: item};
      }, {} as Record<number, AidLookup>);
    });
  }

  deleteAid(row: SubventionAid, index: number, $event: MouseEvent): any {
    $event.preventDefault();
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        click === UserClickOn.YES ? this.subventionAid.splice(index, 1) : null;
        if (!this.subventionAid.length) {
          this.aidChanged$.next(new SubventionAid());
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
}
