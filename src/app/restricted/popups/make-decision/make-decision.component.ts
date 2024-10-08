import { takeUntil, filter, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { WorldCheckService } from '@app/services/world-check.service';

@Component({
  selector: 'app-make-decision',
  templateUrl: './make-decision.component.html',
  styleUrls: ['./make-decision.component.scss']
})
export class MakeDecisionComponent implements OnInit {
  control = new FormControl('', [CustomValidators.required]);
  comment = new FormControl('');
  WORLD_CHECK_SEARCH_DECISION: Lookup[] = this.lookupService.listByCategory.WORLD_CHECK_SEARCH_DECISION;
  destroy$: Subject<void> = new Subject();
  save$: Subject<void> = new Subject<void>();
  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private service: WorldCheckService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      resultId: number
    }) { }

  ngOnInit() {
    this.listenToSave();
  }

  listenToSave() {
    this.save$.pipe(
      takeUntil(this.destroy$),
      filter(_ => this.control.valid),
      switchMap(() => {
        return this.service.worlddCheckInquire({
          id: this.data.resultId,
          actionType: this.control.value?.toString() as string,
          comment: this.comment.value || ''
        })
      })
    )
    .subscribe(() => this.dialogRef.close());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
