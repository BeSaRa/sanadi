import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LookupService} from '@app/services/lookup.service';
import {BehaviorSubject, forkJoin, Observable, of, Subject, Subscription} from 'rxjs';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SubventionRequestPartialLog} from '@app/models/subvention-request-partial-log';
import {SubventionRequestPartialLogService} from '@app/services/subvention-request-partial-log.service';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {isEmptyObject, printBlobData} from '@app/helpers/utils';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DialogService} from '@app/services/dialog.service';
import {ISubventionRequestPartialLogCriteria} from '@app/interfaces/i-subvention-request-partial-log-criteria';
import * as dayjs from 'dayjs';
import {ConfigurationService} from '@app/services/configuration.service';
import {OrgUnit} from '@app/models/org-unit';
import {OrgUser} from '@app/models/org-user';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {ReadModeService} from '@app/services/read-mode.service';
import {Router} from '@angular/router';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from '@app/helpers/date-utils';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {SubventionRequestAid} from '@app/models/subvention-request-aid';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'app-partial-request-reports',
  templateUrl: './partial-request-reports.component.html',
  styleUrls: ['./partial-request-reports.component.scss']
})
export class PartialRequestReportsComponent implements OnInit {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public langService: LangService,
              private toastService: ToastService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private readModeService: ReadModeService,
              private router: Router,
              private configService: ConfigurationService,
              private organizationUnitService: OrganizationUnitService,
              private orgUserService: OrganizationUserService,
              private subventionRequestPartialLogService: SubventionRequestPartialLogService) {
  }

  tabIndex$: Subject<number> = new Subject<number>();
  form: FormGroup = {} as FormGroup;
  private search$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>('init');
  searchSubscription!: Subscription;
  private latestCriteria: Partial<ISubventionRequestPartialLogCriteria> = {} as Partial<ISubventionRequestPartialLogCriteria>;

  logRecords: SubventionRequestPartialLog[] = [];
  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    fromDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    toDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  orgUnitsList: OrgUnit[] = [];
  orgUsersList: OrgUser[] = [];

  filterControl: FormControl = new FormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'beneficiaryCategory', 'requestType', 'requestSummary', 'actionType', 'actionDate', 'userOrganization', 'orgUser'];

  sortingCallbacks = {
    requestDate: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.creationDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.creationDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    beneficiaryCategory: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.benCategoryInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.benCategoryInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestType: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.requestTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.requestTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionType: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.actionTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.actionTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    actionDate: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.actionTime!),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.actionTime!);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    userOrganization: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgAndBranchInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgAndBranchInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    orgUser: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgUserInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgUserInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }


  ngOnInit(): void {
    this.buildForm();
    this.listenToReload();
    this.listenToSearch();
    this._buildDatepickerControlsMap();

    this._loadInitData()
      .subscribe(result => {
        this.orgUnitsList = result.orgUnits;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  private listenToReload() {
    this.reload$.pipe(
      takeUntil(this.destroy$),
      filter(val => val !== 'init')
    ).subscribe(() => {
      debugger
      this.search$.next(false);
    });
  }

  private _loadInitData(): Observable<{ orgUnits: OrgUnit[] }> {
    return forkJoin({
      orgUnits: this.organizationUnitService.load()
    });
  }

  get getResultTabTitle(): string {
    return this.langService.map.search_result + (!this.logRecords.length ? '' : ' (' + this.logRecords.length + ')');
  }

  setInitValue() {
    this.fromDateField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().startOf('year').valueOf())));
    this.fromDateField.updateValueAndValidity();
    this.toDateField.setValue(DateUtils.changeDateToDatepicker(new Date(dayjs().endOf('year').valueOf())));
    this.toDateField.updateValueAndValidity();
  }

  private buildForm() {
    this.form = this.fb.group({
      orgId: [],
      orgUserId: [],
      fromDate: [null, CustomValidators.required],
      toDate: [null, CustomValidators.required]
    });

    this.setInitValue();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      fromDate: this.fromDateField,
      toDate: this.toDateField
    };
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({fromFieldName: fromFieldName, toFieldName: toFieldName, controlOptionsMap: this.datepickerOptionsMap, controlsMap: this.datepickerControlsMap})
  }

  private getSearchCriteria() {
    this.latestCriteria = {...this.form.value};
    if (!this.latestCriteria.fromDate || !this.latestCriteria.toDate) {
      return {};
    }

    // @ts-ignore
    this.latestCriteria.fromDate = dayjs(DateUtils.changeDateFromDatepicker(this.latestCriteria.fromDate)).startOf('day').valueOf();
    // @ts-ignore
    this.latestCriteria.toDate = dayjs(DateUtils.changeDateFromDatepicker(this.latestCriteria.toDate)).endOf('day').valueOf();

    return this.latestCriteria;
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      map((isNewSearch) => {
        if (isNewSearch) {
          return this.getSearchCriteria();
        }
        return this.latestCriteria;
      }),
      switchMap((criteria: Partial<ISubventionRequestPartialLogCriteria>) => {
        if (isEmptyObject(criteria) || !criteria.fromDate || !criteria.toDate) {
          return of({data: [], reason: 'INVALID_CRITERIA'});
        }
        return this.subventionRequestPartialLogService.loadByCriteria(criteria)
          .pipe(
            map((result) => {
              return {data: result, reason: ''};
            }),
            catchError(() => {
              return of({data: [], reason: 'REQUEST_ERROR'});
            })
          );
      }),
      tap((result: IKeyValue) => {
        if (result.reason === 'INVALID_CRITERIA') {
          this.dialogService.info(this.langService.map.msg_invalid_search_criteria);
        } else {
          result.data.length ? this.goToResult() : this.dialogService.info(this.langService.map.no_result_for_your_search_criteria);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe(result => this.logRecords = result.data);
  }

  private goToResult(): void {
    this.tabIndex$.next(1);
  }

  onSearch(): void {
    this.search$.next(true);
  }

  reloadSearchResults() {
    this.search$.next(false);
  }

  clearSearch(): void {
    this.form.reset();
    this.setInitValue();
  }

  loadUsersByOrgUnit(): void {
    this.orgUserField.setValue(null);

    if (!this.orgUnitField || !this.orgUnitField.value) {
      this.orgUsersList = [];
      return;
    }
    this.orgUserService.getByCriteria({'org-id': this.orgUnitField.value})
      .subscribe((result: OrgUser[]) => {
        return this.orgUsersList = result;
      })
  }

  printResult(): void {
    this.subventionRequestPartialLogService.loadByCriteriaAsBlob(this.latestCriteria)
      .subscribe((data) => {
        printBlobData(data, 'PartialRequestLogsByCriteriaSearchResult.pdf');
      });
  }

  get orgUnitField(): FormControl {
    return this.form.get('orgId') as FormControl;
  }

  get orgUserField(): FormControl {
    return this.form.get('orgUserId') as FormControl;
  }

  get fromDateField(): FormControl {
    return this.form.get('fromDate') as FormControl;
  }

  get toDateField(): FormControl {
    return this.form.get('toDate') as FormControl;
  }

}
