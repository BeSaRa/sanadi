import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@services/lang.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
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
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {SortEvent} from '@contracts/sort-event';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {OrgUnit} from '@app/models/org-unit';
import {OrgBranch} from '@app/models/org-branch';
import {OrgUser} from '@app/models/org-user';
import {OrganizationUnitService} from '@services/organization-unit.service';
import {OrganizationBranchService} from '@services/organization-branch.service';
import {OrgStatusEnum, OrgUserStatusEnum} from '@app/enums/status.enum';
import {OrganizationUserService} from '@services/organization-user.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'inquiry-logs',
  templateUrl: './inquiry-logs.component.html',
  styleUrls: ['./inquiry-logs.component.scss']
})
export class InquiryLogsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public langService: LangService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private orgUnitService: OrganizationUnitService,
              private orgBranchService: OrganizationBranchService,
              private orgUserService: OrganizationUserService,
              private beneficiaryService: BeneficiaryService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToSearch();
    this.setInitialValues();
    this.listenToReload();
    this.loadOrganizations();
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
  organizationsList: OrgUnit[] = [];
  branchList: OrgBranch[] = [];
  userList: OrgUser[] = [];
  form: FormGroup = {} as FormGroup;
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
  orgUserStatusEnum = OrgUserStatusEnum;

  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  filterControl: FormControl = new FormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['actionTime', 'organization', 'user']; // add the same columns to searchFields

  sortingCallbacks = {
    actionTime: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.actionTime),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.actionTime);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    organizationAndBranch: (a: BeneficiarySearchLog, b: BeneficiarySearchLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgAndBranchInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgAndBranchInfo?.getName().toLowerCase();
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
      orgBranchId: [{value: null, disabled: true}],
      orgUserId: [{value: null, disabled: true}]
    });
    this._buildDatepickerControlsMap();
  }

  private _buildDatepickerControlsMap() {
    setTimeout(() => {
      this.datepickerControlsMap = {
        fromActionTime: this.fromActionTimeField,
        toActionTime: this.toActionTimeField
      };
    })
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

  get idTypeField(): FormControl {
    return this.form.get('benIdType') as FormControl;
  }

  get idNumberField(): FormControl {
    return this.form.get('benIdNumber') as FormControl;
  }

  get nationalityField(): FormControl {
    return this.form.get('benIdNationality') as FormControl;
  }

  get fromActionTimeField(): FormControl {
    return this.form.get('fromActionTime') as FormControl;
  }

  get toActionTimeField(): FormControl {
    return this.form.get('toActionTime') as FormControl;
  }

  get orgUnitField(): FormControl {
    return this.form.get('orgId') as FormControl;
  }

  get orgBranchField(): FormControl {
    return this.form.get('orgBranchId') as FormControl;
  }

  get orgUserField(): FormControl {
    return this.form.get('orgUserId') as FormControl;
  }

  private static enableFields(fields: FormControl[]) {
    if (fields.length === 1) {
      fields[0].enable();
      return;
    }
    for (let i = 0; i < fields.length; i++) {
      fields[i].enable();
    }
  }

  private static disableFields(fields: FormControl[], resetValues: boolean = false) {
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

  private static resetFields(fields: FormControl[]) {
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

  private loadOrganizations() {
    this.orgUnitService.loadComposite()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          return of([]);
        })
      ).subscribe((result) => {
      this.organizationsList = result;
    })
  }

  handleChangeOrgUnit(orgId: number, userInteraction: boolean) {
    if (userInteraction) {
      this.orgBranchField.reset();
      this.orgUserField.reset();
      this.handleChangeOrgBranch(undefined, true);
    }
    !orgId ? this.orgBranchField.disable() : this.orgBranchField.enable();
    this._loadBranchByOrgId(this.orgUnitField.value);
  }

  private _loadBranchByOrgId(orgUnitId: number) {
    this.branchList = [];
    if (!orgUnitId) {
      return;
    }
    this.orgBranchService.loadByCriteria({'org-id': orgUnitId})
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          return of([]);
        })
      ).subscribe((result) => {
      this.branchList = result;
    })
  }

  handleChangeOrgBranch(orgBranchId: number | undefined, userInteraction: boolean) {
    if (userInteraction) {
      this.orgUserField.reset();
    }
    !orgBranchId ? this.orgUserField.disable() : this.orgUserField.enable();
    this._loadUsersByOrgAndBranchId(this.orgUnitField.value, this.orgBranchField.value);
  }

  private _loadUsersByOrgAndBranchId(orgUnitId: number, orgBranchId: number) {
    this.userList = [];
    if (!orgUnitId || !orgBranchId) {
      return;
    }
    this.orgUserService.getByCriteria({'org-id': orgUnitId, 'org-branch-id': orgBranchId})
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          return of([]);
        })
      ).subscribe((result) => {
      this.userList = result;
    })
  }
}
