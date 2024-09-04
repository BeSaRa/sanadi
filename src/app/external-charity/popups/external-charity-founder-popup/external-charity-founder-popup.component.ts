import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, ValidatorFn } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, Observable, scan, startWith, tap, take, switchMap, takeUntil, filter } from 'rxjs';

@Component({
    selector: 'external-charity-founder-popup',
    templateUrl: 'external-charity-founder-popup.component.html',
    styleUrls: ['external-charity-founder-popup.component.scss']
})
export class ExternalCharityFounderPopupComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>()
    form!: UntypedFormGroup
    model: ExternalCharityFounder
    readonly = false
   
    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lookupService = inject(LookupService);
    saveVisible = true;

    nationalities = this.lookupService.listByCategory.Nationality;

    constructor(
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<ExternalCharityFounder> & { readonly: boolean },
    ) {

        this.model = this.data.model
        this.readonly = this.data.readonly

    }

    ngOnInit(): void {
        this.buildForm()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.destroy$.unsubscribe()
    }

    private buildForm() {
        this.form = this.fb.group(this.model.buildForm(true));
        if (this.readonly) {
            this.form.disable();
            this.saveVisible = false;
          }
    }

    save() {
        const item = new ExternalCharityFounder().clone({
            ... this.model,
            ...this.form.getRawValue(),
        })
        this.dialogRef.close(item)
    }
}