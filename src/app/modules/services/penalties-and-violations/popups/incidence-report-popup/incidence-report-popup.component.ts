import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';

@Component({
    selector: 'incidence-report-popup',
    templateUrl: 'incidence-report-popup.component.html',
    styleUrls: ['incidence-report-popup.component.scss']
})
export class IncidenceReportPopupComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>()
    model: string
    readonly = false
    
    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lookupService = inject(LookupService);
    control!: UntypedFormControl

    nationalities = this.lookupService.listByCategory.Nationality

    constructor(@Inject(DIALOG_DATA_TOKEN) private data: IDialogData<string> & { readonly: boolean },) {

        this.model = this.data.model;
        this.readonly = this.data.readonly;


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
        this.control = this.fb.control(this.model,[CustomValidators.required]);
        this.readonly ? this.control.disable():this.control.enable();

    }

    save() {
        const item = this.control.getRawValue();
        this.dialogRef.close(item)
    }


}

