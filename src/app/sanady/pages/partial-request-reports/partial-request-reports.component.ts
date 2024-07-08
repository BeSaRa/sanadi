import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {LookupService} from '@app/services/lookup.service';
import {BehaviorSubject, forkJoin, Observable, of, Subject, Subscription} from 'rxjs';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SubventionRequestPartialLog} from '@app/models/subvention-request-partial-log';
import {SubventionRequestPartialLogService} from '@app/services/subvention-request-partial-log.service';
import {IMyInputFieldChanged} from '@nodro7/angular-mydatepicker';
import {isEmptyObject, printBlobData} from '@app/helpers/utils';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DialogService} from '@app/services/dialog.service';
import {ISubventionRequestPartialLogCriteria} from '@app/interfaces/i-subvention-request-partial-log-criteria';
import * as dayjs from 'dayjs';
import {ConfigurationService} from '@app/services/configuration.service';
import {ExternalUser} from '@app/models/external-user';
import {ReadModeService} from '@app/services/read-mode.service';
import {Router} from '@angular/router';
import {ExternalUserService} from '@services/external-user.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from '@app/helpers/date-utils';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {Profile} from '@app/models/profile';
import {ProfileService} from '@services/profile.service';

@Component({
  selector: 'app-partial-request-reports',
  templateUrl: './partial-request-reports.component.html',
  styleUrls: ['./partial-request-reports.component.scss']
})
export class PartialRequestReportsComponent implements OnInit {
  private destroy$: Subject<void> = new Subject();

  constructor(public langService: LangService,
              private toastService: ToastService,
              private fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private readModeService: ReadModeService,
              private router: Router,
              private configService: ConfigurationService,
              private profileService: ProfileService,
              private externalUserService: ExternalUserService,
              private subventionRequestPartialLogService: SubventionRequestPartialLogService) {
  }

  tabIndex$: Subject<number> = new Subject<number>();
  form: UntypedFormGroup = {} as UntypedFormGroup;
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

  profilesList: Profile[] = [];
  orgUsersList: ExternalUser[] = [];

  filterControl: UntypedFormControl = new UntypedFormControl('');
  headerColumn: string[] = ['extra-header'];
  displayedColumns: string[] = ['requestFullSerial', 'requestDate', 'requestedAidCategory', 'requestedAid', 'requestSummary', 'actionType', 'actionDate', 'userOrganization', 'orgUser'];

  sortingCallbacks = {
    requestDate: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : DateUtils.getTimeStampFromDate(a.creationDate),
        value2 = !CommonUtils.isValidValue(b) ? '' : DateUtils.getTimeStampFromDate(b.creationDate);
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestAidCategory: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupParentInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupParentInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    requestedAid: (a: SubventionRequestPartialLog, b: SubventionRequestPartialLog, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.aidLookupInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.aidLookupInfo?.getName().toLowerCase();
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
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.orgInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.orgInfo?.getName().toLowerCase();
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
        this.profilesList = result.profiles;
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
      this.search$.next(false);
    });
  }

  private _loadInitData(): Observable<{ profiles: Profile[] }> {
    return forkJoin({
      profiles: this.profileService.loadAsLookups()
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
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: fromFieldName,
      toFieldName: toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    })
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
    this.externalUserService.getByCriteria({'profile-id': this.orgUnitField.value})
      .subscribe((result: ExternalUser[]) => {
        return this.orgUsersList = result;
      })
  }

  printResult(): void {
    this.subventionRequestPartialLogService.loadByCriteriaAsBlob(this.latestCriteria)
      .subscribe((data) => {
        printBlobData(data, 'PartialRequestLogsByCriteriaSearchResult.pdf');
      });
  }

  get orgUnitField(): UntypedFormControl {
    return this.form.get('orgId') as UntypedFormControl;
  }

  get orgUserField(): UntypedFormControl {
    return this.form.get('orgUserId') as UntypedFormControl;
  }

  get fromDateField(): UntypedFormControl {
    return this.form.get('fromDate') as UntypedFormControl;
  }

  get toDateField(): UntypedFormControl {
    return this.form.get('toDate') as UntypedFormControl;
  }

}
