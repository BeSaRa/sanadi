import { exhaustMap, map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { LookupService } from './../../../services/lookup.service';
import { Lookup } from './../../../models/lookup';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { filter } from 'rxjs/operators';
import { DialogService } from '@app/services/dialog.service';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { CustomValidators } from '@app/validators/custom-validators';
import { DateUtils } from '@app/helpers/date-utils';
import { DatepickerControlsMap } from '@app/types/types';
import { WorldCheckService } from '@app/services/world-check.service';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMyDateModel, IMyInputFieldChanged } from '@nodro7/angular-mydatepicker';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { AdminLookup } from '@app/models/admin-lookup';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SearchSource } from '@app/enums/search-source';
import { RestrictedAdvancedSearchItemResult, RestrictedAdvancedSearchResult } from '@app/models/restricted-advanced-search';
import { BannedPerson } from '@app/models/banned-person';
import { BannedPersonTerrorism } from '@app/models/BannedPersonTerrorism';
import { BannedPersonService } from '@app/services/banned-person.service';

@Component({
  selector: 'screening-search-audit',
  templateUrl: './screening-search-audit.component.html',
  styleUrls: ['./screening-search-audit.component.scss']
})
export class ScreeningSearchAuditComponent implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  fb = inject(FormBuilder);
  destroy$: Subject<void> = new Subject();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  search$: Subject<void> = new Subject<void>();
  view$: Subject<WorldCheckSearch> = new Subject<WorldCheckSearch>();
  viewWorldCheck$ = new Subject<number>();
  viewRaca$ = new Subject<number>();
  viewMOI$ = new Subject<number>();

  WORLD_CHECK_ENTITY_TYPE: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_ENTITY_TYPE;
  WORLD_CHECK_SEARCH_DECISION: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_SEARCH_DECISION
  WORLD_CHECK_SEARCH_TYPE: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_SEARCH_TYPE;

  getName(lookups: Lookup[], key: number) {
    return lookups.find(l => l.lookupKey == key)?.getName();
  }
  displayedColumns: string[] = ['targetEnglishName', 'targetArabicName', 'actionDate',
    'actionType',
    'entityType',
    'serviceStatus',
    'internalUserId',
    'internalUserDeptId', 'actions'];
  data: WorldCheckSearch[] = [];
  datepickerOptionsMap: IKeyValue = {
    actionDateFrom: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
    actionDateTo: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
  };
  datepickerControlsMap: DatepickerControlsMap = {};

  actions: IMenuItem<WorldCheckSearch>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item) => this.view$.next(item)
    },
  ];

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    public service: WorldCheckService,
    // don't remove this it required for raca and moi inquiry
    private bannedPersonService:BannedPersonService
  ) { }

  ngOnInit() {
    this.buildSearchForm();
    this.listenToSearchEvent();
    this.listenToView();
    this.listenToViewWorldCheck();
    this.listenToViewRaca();
    this.listenToViewMOI();
  }
  buildSearchForm() {
    this.form = this.fb.group(new WorldCheckSearch().buildSearchForm());

    this.datepickerControlsMap = {
      actionDateFrom: this.actionDateFromField,
      actionDateTo: this.actionDateToField,
    };
    const now = new Date();
    const year = now.getFullYear();
    this.actionDateToField.patchValue(DateUtils.changeDateToDatepicker(now))
    this.actionDateFromField.patchValue(DateUtils.changeDateToDatepicker(now.setFullYear(year - 1)))
  }
  listenToSearchEvent() {
    this.search$
      .pipe(
        filter(() => this.form.valid),
        exhaustMap(() => {
          return this.service.loadByCriteria(this.getSerachCriteria(this.form.value))
        }),
      )
      .pipe(tap(result => !result.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }
  listenToView() {
    this.view$
      // .pipe(switchMap((item: WorldCheckSearch) => {
      //   return this.getInquiryById(item);
      // }))
      // .pipe(switchMap((result: WorldCheckSearchResult) => {
      //   return this.service.openViewWorldCheckSearchResult(result, OperationTypes.VIEW)
      //     .onAfterClose$
      // }))
      // .pipe(tap(_ => this.search$.next()))
      .pipe(tap(item=>this.viewBySearchSource(item)))
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  listenToViewWorldCheck() {
    this.viewWorldCheck$
      .pipe(switchMap((id: number) => {
        return this.service.getInquiryById(id);
      }))
      .pipe(switchMap((result: WorldCheckSearchResult) => {
        return this.service.openViewWorldCheckSearchResult(result, OperationTypes.VIEW)
          .onAfterClose$
      }))
      .pipe(tap(_ => this.search$.next()))
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  listenToViewRaca() {
    this.viewRaca$
      .pipe(switchMap((id: number) => {
        return this.service.getInquiryRacaById(id);
      }))
      .pipe(switchMap((result) => {
        return this.service.openAdvancedSearchResult(new RestrictedAdvancedSearchResult().clone({
          id: result.id,
          name: result.response[0]?.name??'',
          results: result.response.map(item=>new RestrictedAdvancedSearchItemResult().MapFromBannedPerson(item as unknown as BannedPerson))
        }))
          .onAfterClose$
      }))
      .pipe(tap(_ => this.search$.next()))
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  listenToViewMOI() {
    this.viewMOI$
      .pipe(switchMap((id: number) => {
        return this.service.getInquiryMOIById(id);
      }))
      .pipe(switchMap((result) => {
        return this.service.openAdvancedSearchResult(new RestrictedAdvancedSearchResult().clone({
          id: result.id,
          name: result.response[0]?.name??'',
          results: result.response?.map(item=>new RestrictedAdvancedSearchItemResult().MapFromBannedPersonTerrorism(item as unknown as BannedPersonTerrorism))
        }))
          .onAfterClose$
      }))
      .pipe(tap(_ => this.search$.next()))
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  viewBySearchSource(item: WorldCheckSearch) {
    if (item.searchSource === SearchSource.WORLD_CHECK) {
     this.viewWorldCheck$.next(item.id);
    }
    if (item.searchSource === SearchSource.COMMISSION) {
      this.viewRaca$.next(item.id);
    }
    if (item.searchSource === SearchSource.MOI) {
      this.viewMOI$.next(item.id);
    }
  }
  getSerachCriteria(form: WorldCheckSearch) {
    return {
      ...form,
      actionDateFrom: !form.actionDateFrom ? null : DateUtils.getTimeStampFromDate(form.actionDateFrom as unknown as IMyDateModel),
      actionDateTo: !form.actionDateTo ? null : DateUtils.getTimeStampFromDate(form.actionDateTo as unknown as IMyDateModel)
    };
  }
  onDateChange(
    event: IMyInputFieldChanged,
    fromFieldName: string,
    toFieldName: string
  ) {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap,
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get actionDateFromField(): UntypedFormControl {
    return this.form.get('actionDateFrom') as UntypedFormControl;
  }
  get actionDateToField(): UntypedFormControl {
    return this.form.get('actionDateTo') as UntypedFormControl;
  }
}
