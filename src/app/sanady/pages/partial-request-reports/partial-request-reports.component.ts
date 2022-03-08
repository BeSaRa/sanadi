import {Component, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LookupService} from '@app/services/lookup.service';
import {forkJoin, Observable, of, Subject, Subscription} from 'rxjs';
import {FormManager} from '@app/models/form-manager';
import {catchError, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SubventionRequestPartialLog} from '@app/models/subvention-request-partial-log';
import {SubventionRequestPartialLogService} from '@app/services/subvention-request-partial-log.service';
import {IAngularMyDpOptions, IMyInputFieldChanged} from 'angular-mydatepicker';
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
import {DatepickerOptionsMap} from '@app/types/types';

@Component({
  selector: 'app-partial-request-reports',
  templateUrl: './partial-request-reports.component.html',
  styleUrls: ['./partial-request-reports.component.scss']
})
export class PartialRequestReportsComponent implements OnInit {
  private destroy$: Subject<any> = new Subject<any>();
  tabIndex$: Subject<number> = new Subject<number>();
  form: FormGroup = {} as FormGroup;
  fm: FormManager = {} as FormManager;
  private search$: Subject<any> = new Subject<any>();
  searchSubscription!: Subscription;
  private latestCriteria: Partial<ISubventionRequestPartialLogCriteria> = {} as Partial<ISubventionRequestPartialLogCriteria>;

  logRecords: SubventionRequestPartialLog[] = [];
  datepickerOptionsMap: DatepickerOptionsMap = {
    fromDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    toDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };
  private datepickerFieldPathMap: IKeyValue = {
    fromDate: 'fromDate',
    toDate: 'toDate',
  };
  orgUnitsList: OrgUnit[] = [];
  orgUsersList: OrgUser[] = [];

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

  ngOnInit(): void {
    this.buildForm();
    this.listenToSearch();

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
    this.fm = new FormManager(this.form, this.langService);

    this.setInitValue();
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    this.setRelatedMinDate(fromFieldName, toFieldName);
    this.setRelatedMaxDate(fromFieldName, toFieldName);
  }

  setRelatedMinDate(fromFieldName: string, toFieldName: string, disableSelectedFromRelated: boolean = false): void {
    setTimeout(() => {
      let toFieldDateOptions: IAngularMyDpOptions = DateUtils.getDatePickerOptionsClone(this.datepickerOptionsMap[toFieldName]);
      const fromDate = DateUtils.changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[fromFieldName])?.value);
      if (!fromDate) {
        toFieldDateOptions.disableUntil = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(fromDate);
        disableDate.setHours(0, 0, 0, 0); // set fromDate to start of day
        if (!disableSelectedFromRelated) {
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

  setRelatedMaxDate(fromFieldName: string, toFieldName: string, disableSelectedFromRelated: boolean = false): void {
    setTimeout(() => {
      let fromFieldDateOptions: IAngularMyDpOptions = DateUtils.getDatePickerOptionsClone(this.datepickerOptionsMap[fromFieldName]);
      const toDate = DateUtils.changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[toFieldName])?.value);
      if (!toDate) {
        fromFieldDateOptions.disableSince = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(toDate);
        if (!disableSelectedFromRelated) {
          disableDate.setDate(disableDate.getDate() + 1);
        }
        fromFieldDateOptions.disableSince = {
          year: disableDate.getFullYear(),
          month: disableDate.getMonth() + 1,
          day: disableDate.getDate()
        }
      }
      this.datepickerOptionsMap[fromFieldName] = fromFieldDateOptions;
    }, 100);
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
    return this.fm.getFormField('orgId') as FormControl;
  }

  get orgUserField(): FormControl {
    return this.fm.getFormField('orgUserId') as FormControl;
  }

  get fromDateField(): FormControl {
    return this.fm.getFormField('fromDate') as FormControl;
  }

  get toDateField(): FormControl {
    return this.fm.getFormField('toDate') as FormControl;
  }

}
