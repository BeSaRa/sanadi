import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {ToastService} from '../../../services/toast.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LookupService} from '../../../services/lookup.service';
import {forkJoin, Observable, of, Subject, Subscription} from 'rxjs';
import {FormManager} from '../../../models/form-manager';
import {catchError, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {SubventionRequestPartialLog} from '../../../models/subvention-request-partial-log';
import {SubventionRequestPartialLogService} from '../../../services/subvention-request-partial-log.service';
import {IAngularMyDpOptions, IMyInputFieldChanged} from 'angular-mydatepicker';
import {
  changeDateFromDatepicker, changeDateToDatepicker,
  getDatepickerOptions,
  getDatePickerOptionsClone,
  isEmptyObject, printBlobData
} from '../../../helpers/utils';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {DialogService} from '../../../services/dialog.service';
import {ISubventionRequestPartialLogCriteria} from '../../../interfaces/i-subvention-request-partial-log-criteria';
import * as dayjs from 'dayjs';
import {ConfigurationService} from '../../../services/configuration.service';
import {OrgUnit} from '../../../models/org-unit';
import {OrgUser} from '../../../models/org-user';
import {OrganizationUnitService} from '../../../services/organization-unit.service';
import {ReadModeService} from '../../../services/read-mode.service';
import {Router} from '@angular/router';
import {OrganizationUserService} from '../../../services/organization-user.service';
import {CustomValidators} from '../../../validators/custom-validators';

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
  datepickerOptionsMap: IKeyValue = {
    fromDate: getDatepickerOptions({disablePeriod: 'none'}),
    toDate: getDatepickerOptions({disablePeriod: 'none'})
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
    this.fromDateField.setValue(changeDateToDatepicker(new Date(dayjs().startOf('year').valueOf())));
    this.fromDateField.updateValueAndValidity();
    this.toDateField.setValue(changeDateToDatepicker(new Date(dayjs().endOf('year').valueOf())));
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
      let toFieldDateOptions: IAngularMyDpOptions = getDatePickerOptionsClone(this.datepickerOptionsMap[toFieldName]);
      const fromDate = changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[fromFieldName])?.value);
      if (!fromDate) {
        toFieldDateOptions.disableUntil = {year: 0, month: 0, day: 0};
      } else {
        const disableDate = new Date(fromDate);
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
      let fromFieldDateOptions: IAngularMyDpOptions = getDatePickerOptionsClone(this.datepickerOptionsMap[fromFieldName]);
      const toDate = changeDateFromDatepicker(this.fm.getFormField(this.datepickerFieldPathMap[toFieldName])?.value);
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
    this.latestCriteria.fromDate = dayjs(changeDateFromDatepicker(this.latestCriteria.fromDate)).startOf('day').valueOf();
    // @ts-ignore
    this.latestCriteria.toDate = dayjs(changeDateFromDatepicker(this.latestCriteria.toDate)).endOf('day').valueOf();

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
        return this.subventionRequestPartialLogService.loadPartialRequestsLogsByCriteria(criteria)
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

  loadUsersByOrgUnit($event: MouseEvent): void {
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
