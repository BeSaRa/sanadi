import { Component, computed, effect, inject, Inject, Injector, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LegalBasis } from '@app/models/legal-basis';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';

@Component({
    selector: 'penalty-legal-basis-popup',
    templateUrl: 'penalty-legal-basis-popup.component.html',
    styleUrls: ['penalty-legal-basis-popup.component.scss']
})
export class PenaltyLegalBasisPopupComponent  {

    model: number |null
    readonly = false
    
    lang = inject(LangService);
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    injector =inject(Injector);
    control:UntypedFormControl= this.fb.control(null,[CustomValidators.required]);
    legalBasisList!: LegalBasis[]
    controlChanged =toSignal<number|null>(this.control.valueChanges,{injector:this.injector}); 
    selectedLegalBasis= computed(()=>
        this.legalBasisList.find(item=>item.id === this.controlChanged())
    )

    constructor(@Inject(DIALOG_DATA_TOKEN) private data: IDialogData<number|null> & { readonly: boolean },) {

        this.model = this.data.model;
        this.readonly = this.data.readonly;
        this.legalBasisList= this.data.extraData.legalBasisList??[];
        this.control.patchValue(this.model);
        this.readonly ? this.control.disable():this.control.enable();


    }
   
    save() {
        this.dialogRef.close(this.controlChanged())
    }


}
