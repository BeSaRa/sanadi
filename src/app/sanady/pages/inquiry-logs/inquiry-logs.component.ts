import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {Lookup} from '@app/models/lookup';
import {BeneficiaryIdTypes} from '@app/enums/beneficiary-id-types.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {BeneficiarySearchLog} from '@app/models/beneficiary-search-log';
import {IBeneficiarySearchLogCriteria} from '@contracts/i-beneficiary-search-log-criteria';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {BeneficiaryService} from '@services/beneficiary.service';
import {CommonUtils} from '@helpers/common-utils';
import {IMyInputFieldChanged} from '@nodro7/angular-mydatepicker';
import {SortEvent} from '@contracts/sort-event';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ExternalUser} from '@app/models/external-user';
import {OrgStatusEnum} from '@app/enums/status.enum';
import {ExternalUserService} from '@services/external-user.service';
import * as dayjs from 'dayjs';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {ProfileService} from '@services/profile.service';
import {Profile} from '@app/models/profile';

@Component({
  selector: 'inquiry-logs',
  templateUrl: './inquiry-logs.component.html',
  styleUrls: ['./inquiry-logs.component.scss']
})
export class InquiryLogsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject();

  constructor(public langService: LangService,
              private fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private profileService: ProfileService,
              private externalUserService: ExternalUserService,
              private beneficiaryService: BeneficiaryService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToSearch();
    this.listenToReload();
    this.loadProfiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  tabIndex$: Subject<number> = new Subject<number>();
  identificationTypesList: Lookup[] = [
    (new Lookup).clone({
      arName: this.langService.getArabicLocalByKey('beneficiary_primary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_primary_id'),
      lookupKey: 1,
      lookupStrKey: 'IDENTIFICATION_PRIMARY'
    }),
    (new Lookup).clone({
      arName: this.langService.getArabicLocalByKey('beneficiary_secondary_id'),
      enName: this.langService.getEnglishLocalByKey('beneficiary_secondary_id'),
      lookupKey: 2,
      lookupStrKey: 'IDENTIFICATION_SECONDARY'
    })
  ];
  idTypes: Lookup[] = this.lookupService.listByCategory.BenIdType;
  nationalitiesList: Lookup[] = this.lookupService.listByCategory.Nationality;
  gulfNationalitiesList: Lookup[] = this.lookupService.listByCategory.GulfCountries;
  organizationsList: Profile[] = [];
  userList: ExternalUser[] = [];
  form: UntypedFormGroup = {} as UntypedFormGroup;
  logsList: BeneficiarySearchLog[] = [];
  private search$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  private idTypesValidationsMap: { [index: number]: any } = {
    [BeneficiaryIdTypes.PASSPORT]: CustomValidators.commonValidations.passport,
    [BeneficiaryIdTypes.VISA]: CustomValidators.commonValidations.visa,
    [BeneficiaryIdTypes.QID]: CustomValidators.commonValidations.qId,
    [BeneficiaryIdTypes.GCC_ID]: CustomValidators.commonValidations.gccId
  };

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    fromActionTime: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    toActionTime: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  orgStatusEnum = OrgStatusEnum;
  commonStatusEnum = CommonStatusEnum;

  filterControl: UntypedFormControl = new UntypedFormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['actionTime', 'organization', 'user']; // add the same columns to searchFields

  sortingCallbacks = {
    actionTime: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.actionTime),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.actionTime);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organization: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    orgUser: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    benIdType: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.benIdTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.benIdTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  actions: IMenuItem<BeneficiarySearchLog>[] = [];

  get getResultTabTitle(): string {
    return this.langService.map.search_result + (!this.logsList.length ? '' : ' (' + this.logsList.length + ')');
  }

  private buildForm() {
    this.form = this.fb.group({
      fromActionTime: [null, [CustomValidators.required]],
      toActionTime: [null, [CustomValidators.required]],
      benIsPrimaryId: [],
      benIdType: [{value: null, disabled: true}],
      benIdNumber: [{value: null, disabled: true}],
      benIdNationality: [{value: null, disabled: true}],
      orgId: [],
      orgUserId: [{value: null, disabled: true}]
    });
    this._buildDatepickerControlsMap();
    this.setInitialValues();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      fromActionTime: this.fromActionTimeField,
      toActionTime: this.toActionTimeField
    };
  }

  onSearch(): void {
    this.search$.next(true);
  }

  clearSearch(): void {
    this.form.reset();
    this.setInitialValues();
  }

  private setInitialValues(): void {
    this.fromActionTimeField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().startOf('year').valueOf())));
    this.toActionTimeField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().endOf('year').valueOf())));
  }

  private prepareSearchCriteria(): Partial<IBeneficiarySearchLogCriteria> {
    let formValue = this.form.value,
      primaryId = this.identificationTypesList.find(x => x.lookupStrKey === 'IDENTIFICATION_PRIMARY')!.lookupKey;

    return {
      ...formValue,
      benIsPrimaryId: !formValue.benIsPrimaryId ? undefined : (formValue.benIsPrimaryId === primaryId)
    };
  }

  private listenToSearch(): void {
    this.search$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return this.prepareSearchCriteria();
      }),
      switchMap((criteria) => {
        return this.beneficiaryService.loadBeneficiaryLogByCriteria(criteria)
          .pipe(
            takeUntil(this.destroy$),
            catchError(() => {
              return of([]);
            }));
      }),
      tap((result: BeneficiarySearchLog[]) => {
        return result.length ? this.goToResult() : this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
      }),
    ).subscribe(result => this.logsList = result);
  }

  private goToResult(): void {
    this.tabIndex$.next(1);
  }

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => {
      this.search$.next(true);
    });
  }

  get idTypeField(): UntypedFormControl {
    return this.form.get('benIdType') as UntypedFormControl;
  }

  get idNumberField(): UntypedFormControl {
    return this.form.get('benIdNumber') as UntypedFormControl;
  }

  get nationalityField(): UntypedFormControl {
    return this.form.get('benIdNationality') as UntypedFormControl;
  }

  get fromActionTimeField(): UntypedFormControl {
    return this.form.get('fromActionTime') as UntypedFormControl;
  }

  get toActionTimeField(): UntypedFormControl {
    return this.form.get('toActionTime') as UntypedFormControl;
  }

  get orgUnitField(): UntypedFormControl {
    return this.form.get('orgId') as UntypedFormControl;
  }

  get orgUserField(): UntypedFormControl {
    return this.form.get('orgUserId') as UntypedFormControl;
  }

  private static enableFields(fields: UntypedFormControl[]) {
    if (fields.length === 1) {
      fields[0].enable();
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      fields[i].enable();
    }
  }

  private static disableFields(fields: UntypedFormControl[], resetValues: boolean = false) {
    if (fields.length === 1) {
      fields[0].disable();
      resetValues ? this.resetFields(fields) : null;
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      fields[i].disable();
      resetValues ? this.resetFields(fields) : null;
    }
  }

  private static resetFields(fields: UntypedFormControl[]) {
    if (fields.length === 1) {
      fields[0].reset();
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      fields[i].reset();
    }
  }

  handleIdentificationChange(value: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.idTypeField.reset();
    }
    !value ? this.idTypeField.disable() : this.idTypeField.enable();
    this.handleIdTypeChange(this.idTypeField.value, userInteraction);
  }

  handleIdTypeChange(idTypeValue: number, userInteraction: boolean = false): void {
    let dependentFields = [this.idNumberField, this.nationalityField];
    if (userInteraction) {
      InquiryLogsComponent.resetFields(dependentFields);
      this.nationalityField.setValue(InquiryLogsComponent.getNationalityByIdType(idTypeValue));
    }
    if (!idTypeValue) {
      InquiryLogsComponent.disableFields(dependentFields);
    } else {
      InquiryLogsComponent.enableFields([this.idNumberField]);
      if (this.isPassportId() || this.isGCCId()) {
        this.nationalityField.enable();
      } else {
        this.nationalityField.disable();
      }
    }
    this.idNumberField.setValidators(this.idTypesValidationsMap[idTypeValue]);
  }

  isGCCId(): boolean {
    return this.idTypeField.value === BeneficiaryIdTypes.GCC_ID;
  }

  isPassportId(): boolean {
    return this.idTypeField.value === BeneficiaryIdTypes.PASSPORT;
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

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: fromFieldName,
      toFieldName: toFieldName,
      controlsMap: this.datepickerControlsMap,
      controlOptionsMap: this.datepickerOptionsMap
    });
  }

  private loadProfiles() {
    this.profileService.loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      ).subscribe((result) => {
      this.organizationsList = result;
    })
  }

  handleChangeOrgUnit(orgId: number, userInteraction: boolean) {
    if (userInteraction) {
      this.orgUserField.reset();
    }
    !orgId ? this.orgUserField.disable() : this.orgUserField.enable();
    this._loadUsersByOrgId(this.orgUnitField.value);
  }

  private _loadUsersByOrgId(orgUnitId: number) {
    this.userList = [];
    if (!orgUnitId) {
      return;
    }
    this.externalUserService.getByCriteria({'profile-id': orgUnitId})
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      ).subscribe((result) => {
      this.userList = result;
    })
  }
}
