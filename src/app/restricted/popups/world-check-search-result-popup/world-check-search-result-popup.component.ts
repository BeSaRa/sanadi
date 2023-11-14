import { takeUntil, switchMap } from 'rxjs/operators';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { WorldCheckSearchResult } from '@app/models/world-check-search-result';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';
import { DialogService } from '@app/services/dialog.service';
import { MakeDecisionComponent } from '../make-decision/make-decision.component';
import { OperationTypes } from '@app/enums/operation-types.enum';

@Component({
  selector: 'world-check-search-result-popup',
  templateUrl: './world-check-search-result-popup.component.html',
  styleUrls: ['./world-check-search-result-popup.component.scss']
})
export class WorldCheckSearchResultPopupComponent implements OnInit, OnDestroy {
  name!: string;
  displayedColumns: string[] = ['matchStrength', 'matchedTerm', 'primaryName', 'dateOfBirth', 'dead', 'category', 'gender', 'countryLinks'];
  $makeDecision = new Subject<number>();
  operationTypes = OperationTypes;
  destroy$: Subject<any> = new Subject<any>();
  constructor(
    private dialog: DialogService,
    public lang: LangService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      result: WorldCheckSearchResult,
      operation: OperationTypes
    }) { }

  ngOnInit() {
    this.name = this.data.result.name;
    this.listenToMakeDecision();
  }
  listenToMakeDecision() {
    this.$makeDecision
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap((resultId) => this.dialog.show(MakeDecisionComponent, {
          resultId: resultId
        }).onAfterClose$)
      )
      .subscribe(() => this.dialogRef.close());
  }
  getDeadDays(events: any) {
    const dead = events.find((e: any) => e.type == 'DEATH');
    return dead ? dead.fullDate : ' --- ';
  }
  getBirthDays(events: any) {
    const birth = events.filter((e: any) => e.type == 'BIRTH');
    return birth.reduce((curr: any, next: any) => {
      return (curr ? curr + ' / ' : '') + next.fullDate
    }, '');
  }
  getCountries(countries: any) {
    return countries.reduce((curr: any, next: any) => {
      return (curr ? curr + ' / ' : '') + next.country.name
    }, '');
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
