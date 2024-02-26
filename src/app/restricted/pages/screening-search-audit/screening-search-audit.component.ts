import { exhaustMap, map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { LookupService } from './../../../services/lookup.service';
import { Lookup } from './../../../models/lookup';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { filter } from 'rxjs/operators';
import { DialogService } from '@app/services/dialog.service';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { CustomValidators } from '@app/validators/custom-validators';
import { DateUtils } from '@app/helpers/date-utils';
import { DatepickerControlsMap } from '@app/types/types';
import { WorldCheckService } from '@app/services/world-check.service';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { IMyDateModel, IMyInputFieldChanged } from 'angular-mydatepicker';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { AdminLookup } from '@app/models/admin-lookup';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { OperationTypes } from '@app/enums/operation-types.enum';

@Component({
  selector: 'screening-search-audit',
  templateUrl: './screening-search-audit.component.html',
  styleUrls: ['./screening-search-audit.component.scss']
})
export class ScreeningSearchAuditComponent implements OnInit {
  form!: UntypedFormGroup;
  fb = inject(FormBuilder);
  destroy$: Subject<any> = new Subject<any>();
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  search$: Subject<void> = new Subject<void>();
  view$: Subject<number> = new Subject<number>();
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

  actions: IMenuItem<AdminLookup>[] = [
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      onClick: (item) => this.view$.next(item.id)
    },
  ];

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    public service: WorldCheckService,
  ) { }

  ngOnInit() {
    this.buildSearchForm();
    this.listenToSearchEvent();
    this.listenToView();
  }
  buildSearchForm() {
    this.form = this.fb.group(new WorldCheckSearch().buildSearchForm());

    this.datepickerControlsMap = {
      actionDateFrom: this.form.get('actionDateFrom')!,
      actionDateTo: this.form.get('actionDateTo')!,
    };
  }
  listenToSearchEvent() {
    this.search$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        filter(() => this.form.valid),
        exhaustMap(() => {
          return this.service.loadByCriteria(this.getSerachCriteria(this.form.value))
        }),
      )
      .pipe(tap(result => !result.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .subscribe(data => {
        this.data = data;
      });
  }
  listenToView() {
    this.view$
      .pipe(switchMap((id: number) => {
        return this.service.getInquiryById(id)
      }))
      .pipe(switchMap((result: WorldCheckSearchResult) => {
        return this.service.openViewWorldCheckSearchResult(result, OperationTypes.VIEW)
          .onAfterClose$
      }))
      .subscribe();
  }
  getSerachCriteria(form: WorldCheckSearch) {
    return {
      ...form,
      actionDateFrom: !form.actionDateFrom ? 0 : DateUtils.getTimeStampFromDate(form.actionDateFrom as unknown as IMyDateModel),
      actionDateTo: !form.actionDateTo ? 0 : DateUtils.getTimeStampFromDate(form.actionDateTo as unknown as IMyDateModel)
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

}
