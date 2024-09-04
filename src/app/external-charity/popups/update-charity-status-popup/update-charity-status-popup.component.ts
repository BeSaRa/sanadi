import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminLookup } from '@app/models/admin-lookup';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { filter, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'update-charity-status-popup',
    templateUrl: 'update-charity-status-popup.component.html',
    styleUrls: ['update-charity-status-popup.component.scss']
})
export class UpdateCharityStatusPopupComponent implements OnInit, OnDestroy {

    popupTitle: keyof ILanguageKeys = 'reject_reason';
    save$: Subject<void> = new Subject();
    destroy$: Subject<void> = new Subject();

    model!: AdminLookup[];
    lang = inject(LangService);
    dialogRef= inject(DialogRef);
    form!: UntypedFormGroup;

    constructor(
         private fb:FormBuilder,
        @Inject(DIALOG_DATA_TOKEN) data: IDialogData<AdminLookup[]>,) {
        this.model = data.model;
        
    }
    ngOnInit(): void {
        this.form = this.fb.group({
            comments: new  UntypedFormControl('', [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]),
            statusId : new  UntypedFormControl(null, [CustomValidators.required])
        });
        this._listenToSave();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _listenToSave() {
        this.save$.pipe(
            filter(_ => this.form.valid),
            tap(() => this.dialogRef.close(this.form.getRawValue())),
            takeUntil(this.destroy$)
        ).subscribe();
    }
}
