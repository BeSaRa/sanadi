import { exhaustMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { LookupService } from './../../../services/lookup.service';
import { Lookup } from './../../../models/lookup';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { LangService } from '@app/services/lang.service';
import { WorldCheckService } from '@app/services/world-check.service';
import { filter } from 'rxjs/operators';
import { DialogService } from '@app/services/dialog.service';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';

@Component({
  selector: 'world-check-search',
  templateUrl: './world-check-search.component.html',
  styleUrls: ['./world-check-search.component.scss']
})
export class WorldCheckSerachComponent implements OnInit {
  form!: UntypedFormGroup;
  fb = inject(FormBuilder);
  inquery$: Subject<void> = new Subject<void>();
  WORLD_CHECK_ENTITY_TYPE: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_ENTITY_TYPE;
  WORLD_CHECK_SEARCH_DECISION: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_SEARCH_DECISION

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialogService: DialogService,
    public service: WorldCheckService,
  ) { }

  ngOnInit() {
    this.buildSearchForm();
    this.listenToSearchEvent();
  }
  buildSearchForm() {
    this.form = this.fb.group(new WorldCheckSearch().buildInquireForm());
  }
  listenToSearchEvent() {
    this.inquery$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        filter(() => this.form.valid),
        exhaustMap(() => {
          return this.service.loadByInquire({...this.form.value, entityType: this.form.value.entityType.toString()})
        }),
      )
      .pipe(tap((res: WorldCheckSearchResult) => !res.results.length && this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(result => !!result.results.length))
      .pipe(exhaustMap((result) => {
        return this.openViewWorldCheckSearchResult(result);
      }))
      .subscribe();
  }
  private openViewWorldCheckSearchResult(result: WorldCheckSearchResult): Observable<undefined | WorldCheckSearchResult> {
    return this.service.openViewWorldCheckSearchResult(result)
      .onAfterClose$
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
