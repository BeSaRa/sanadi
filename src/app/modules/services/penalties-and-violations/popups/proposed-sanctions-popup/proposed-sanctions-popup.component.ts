import { Component, computed, inject, Inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AdminResult } from '@app/models/admin-result';
import { Penalty } from '@app/models/penalty';
import { ProposedSanction } from '@app/models/proposed-sanction';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
    selector: 'proposed-sanctions-popup',
    templateUrl: 'proposed-sanctions-popup.component.html',
    styleUrls: ['proposed-sanctions-popup.component.scss']
})
export class ProposedSanctionsPopupComponent {
    model: ProposedSanction
    readonly = false
    
    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    injector =inject(Injector);
    form:UntypedFormGroup= this.fb.group(new ProposedSanction().buildForm(true));
    penalties!: Penalty[]

    get idControl():UntypedFormControl{
        return this.form.get('id') as UntypedFormControl;
    }
    
    controlChanged =toSignal<number>(this.idControl.valueChanges,{injector:this.injector}); 
    selectedPenalty= computed(()=>
        this.penalties.find(item=>item.id === this.controlChanged())
    )

    constructor(@Inject(DIALOG_DATA_TOKEN) private data: IDialogData<ProposedSanction> & { readonly: boolean },) {

        this.model = this.data.model;
        this.readonly = this.data.readonly;
        this.penalties= this.data.extraData.penaltyList??[];
        this.form.patchValue(this.model)
        this.readonly ? this.form.disable():this.form.enable();

    }
   
    save() {

        const item = new ProposedSanction().clone({
            ... this.model,
            ...this.form.getRawValue(),
            penaltyInfo : this.selectedPenalty()
        })
        this.dialogRef.close(item)
    }


}


