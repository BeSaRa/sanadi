import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { BannedPerson } from '@app/models/banned-person';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { MakeDecisionComponent } from '../make-decision/make-decision.component';
import { DialogService } from '@app/services/dialog.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { RestrictedAdvancedSearchResult } from '@app/models/restricted-advanced-search';
import { EmployeeService } from '@app/services/employee.service';
import { PermissionsEnum } from '@app/enums/permissions-enum';

@Component({
    selector: 'advanced-search-results-popup',
    templateUrl: 'advanced-search-results-popup.component.html',
    styleUrls: ['advanced-search-results-popup.component.scss']
})
export class AdvancedSearchResultsPopupComponent implements OnInit, OnDestroy {

    lang= inject(LangService);
    dialog = inject(DialogService);
    dialogRef = inject(DialogRef);
    employeeService = inject(EmployeeService);
    displayedColumns: string[] = [ 'primaryName', 'dateOfBirth', 'gender' ,'source'];
    $makeDecision = new Subject<number>();

    destroy$: Subject<void> = new Subject();

    constructor( @Inject(DIALOG_DATA_TOKEN) public data: {
        result: RestrictedAdvancedSearchResult,
        operation: OperationTypes
      },
    ) {
        
    }
    ngOnInit() {
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
      ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
      }

      get showWarning(){
        return !this.employeeService.hasPermissionTo(PermissionsEnum.MANAGE_BANNED_PERSON_RACA)
      }
}
