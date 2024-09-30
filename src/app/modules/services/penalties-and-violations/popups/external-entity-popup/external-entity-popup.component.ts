import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ExternalEntity } from '@app/models/external-entity';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';

@Component({
    selector: 'external-entity-popup',
    templateUrl: 'external-entity-popup.component.html',
    styleUrls: ['external-entity-popup.component.scss']
})
export class ExternalEntityPopupComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>()
    form!: UntypedFormGroup
    model: ExternalEntity
    readonly = false

    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lookupService = inject(LookupService);

    nationalities = this.lookupService.listByCategory.Nationality

    constructor(@Inject(DIALOG_DATA_TOKEN) private data: IDialogData<ExternalEntity> & { readonly: boolean },) {

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
        this.form = this.fb.group(this.model.buildForm(true));
        this.readonly ? this.form.disable():this.form.enable();

    }

    save() {
        const item = new ExternalEntity().clone({
            ... this.model,
            ...this.form.getRawValue(),
        })
        this.dialogRef.close(item)
    }


}
