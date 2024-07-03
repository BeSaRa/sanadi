import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PermissionsEnum } from '@app/enums/permissions-enum';
import { Lookup } from '@app/models/lookup';
import { RestrictedAdvancedSearchItemResult, RestrictedAdvancedSearchResult } from '@app/models/restricted-advanced-search';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { BannedPersonService } from '@app/services/banned-person.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { WorldCheckService } from '@app/services/world-check.service';
import { advancedSearchDatabase } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'advanced-search',
  templateUrl: 'advanced-search.component.html',
  styleUrls: ['advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {

  form!: UntypedFormGroup;
  fb = inject(FormBuilder);
  inquiry$: Subject<void> = new Subject<void>();
  WORLD_CHECK_ENTITY_TYPE: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_ENTITY_TYPE;
  WORLD_CHECK_SEARCH_DECISION: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_SEARCH_DECISION

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    public worldCheckService: WorldCheckService,
    private bannedPersonService: BannedPersonService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.buildSearchForm();
    this.listenToSearchEvent();
  }
  get worldCheckAllowed(): boolean {
    return this.employeeService.hasPermissionTo(PermissionsEnum.WORLD_CHECK_SEARCH)
  }
  get racaAllowed(): boolean {
    return this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_BANNED_PERSON_RACA)
  }
  get moiAllowed(): boolean {
    return this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_BANNED_PERSON_MOI)
  }
  databases: advancedSearchDatabase[] = [
    {
      source: 'world-check', name: 'lbl_world_check',
      checked: this.worldCheckAllowed,
      fn: () => this.getWorldCheckInquiry(),
      show:()=> this.worldCheckAllowed
    },
    {
      source: 'raca', name: 'lbl_commission',
      checked: this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_BANNED_PERSON_RACA),
      fn: () => this.getRacaInquiry(),
      show:()=> this.racaAllowed
    },
    {
      source: 'moi', name: 'lbl_moi',
      checked: this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_BANNED_PERSON_MOI),
      fn: () => this.getMOIInquiry(),
      show:()=> this.moiAllowed
    },
  ]
  buildSearchForm() {
    this.form = this.fb.group({
      targetName: new FormControl<string>('', [CustomValidators.required, CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]),
      entityType: new FormControl<number>(1),

    });

  }
  get targetNameControl(): UntypedFormControl {
    return this.form.get('targetName') as UntypedFormControl;
  }
  get entityTypeControl(): UntypedFormControl {
    return this.form.get('entityType') as UntypedFormControl;
  }



  worldCheckId?: number
  getWorldCheckInquiry() {
    return this.worldCheckService
      .loadByInquire({ targetName: this.targetNameControl.value, entityType: this.entityTypeControl.value.toString() })
      .pipe(tap(result => this.worldCheckId = result.id))
      .pipe(map(result => new RestrictedAdvancedSearchResult().MapFromWorldCheckResult(result)));



  }
  getRacaInquiry() {
    return this.bannedPersonService.searchByCriteria({ name: this.targetNameControl.value })
      .pipe(map(items => items.map(item => new RestrictedAdvancedSearchItemResult().MapFromBannedPerson(item))))


  }
  getMOIInquiry() {
    return this.bannedPersonService.getMOIByCriteria({ name: this.targetNameControl.value })
      .pipe(map(items => items.map(item => new RestrictedAdvancedSearchItemResult().MapFromBannedPersonTerrorism(item))))


  }
  generateSearchArray(): Observable<RestrictedAdvancedSearchItemResult[]>[] {
    return this.databases.reduce((acc, item) => {
      if (item.checked) {
        acc.push(item.fn())
      }
      return acc
    }, [] as Observable<any>[])

  }
  get isDataBaseSelected(): boolean {
    return this.databases.some(item => item.checked)
  }
  listenToSearchEvent() {
    this.inquiry$
      .pipe(
        filter(() => this.form.valid && this.isDataBaseSelected),
        exhaustMap(() => {
          return combineLatest(this.generateSearchArray())

        }),
      )
      .pipe(map(res => {
        return new RestrictedAdvancedSearchResult().clone({
          id: this.worldCheckId,
          name: this.targetNameControl.value,
          results: res.reduce((acc, item) => acc.concat(item), [])
        })

      }))
      .pipe(tap((res) => !res.results.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(result => !!result.results.length))
      .pipe(exhaustMap((result) => {
        return this.openAdvancedSearchResult(result);
      }))
      .pipe(takeUntil(this.destroy$))
      .subscribe(


    );
  }
  private openAdvancedSearchResult(result: RestrictedAdvancedSearchResult): Observable<undefined | WorldCheckSearchResult> {
    return this.worldCheckService.openAdvancedSearchResult(result)
      .onAfterClose$
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


  toggleDatabase(value: advancedSearchDatabase) {
    value.checked = !value.checked
  }
}
