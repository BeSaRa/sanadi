import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionSpecialist } from '@app/models/inspection-specialist';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';

@Component({
    selector: 'external-specialist-popup',
    templateUrl: 'external-specialist-popup.component.html',
    styleUrls: ['external-specialist-popup.component.scss']
})
export class ExternalSpecialistPopupComponent implements OnInit, OnDestroy {
    
    private destroy$ = new Subject<void>()
    form!: UntypedFormGroup
    model: InspectionSpecialist
    readonly = false


    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        private fb: UntypedFormBuilder,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<InspectionSpecialist> & { readonly: boolean }
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
        this.destroy$.subscribe()
    }

    private buildForm() {
        this.form = this.fb.group(this.model.buildForm(true))
    }

    save() {
        const item = new InspectionSpecialist().clone({
            ... this.model,
            ...this.form.getRawValue(),
        })
        this.dialogRef.close(item)
    }

    
}
