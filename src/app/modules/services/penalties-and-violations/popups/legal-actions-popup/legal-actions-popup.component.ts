import { Component, computed, inject, Inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LegalAction } from '@app/models/legal-action';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'legal-actions-popup',
    templateUrl: 'legal-actions-popup.component.html',
    styleUrls: ['legal-actions-popup.component.scss']
})
export class LegalActionsPopupComponent {
    model: number |null
    readonly = false
    
    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    injector =inject(Injector);
    legalActionList!: LegalAction[]
    control:UntypedFormControl= this.fb.control(null,[CustomValidators.required]);
    controlChanged =toSignal<number|null>(this.control.valueChanges,{injector:this.injector}); 
    selectedLegalAction= computed(()=>
        this.legalActionList.find(item=>item.id === this.controlChanged())
    )

    constructor(@Inject(DIALOG_DATA_TOKEN) private data: IDialogData<number|null> & { readonly: boolean },) {

        this.model = this.data.model;
        this.readonly = this.data.readonly;
        this.legalActionList= this.data.extraData.legalActionList??[];
        this.control.patchValue(this.model);

    }
   
    save() {
        this.dialogRef.close(this.controlChanged())
    }


}
