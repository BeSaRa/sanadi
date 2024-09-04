import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, ValidatorFn } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { VerificationTemplate } from '@app/models/verification-template';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject, Observable } from 'rxjs';
import { scan, startWith, switchMap, takeUntil,tap, take, filter } from 'rxjs/operators';

@Component({
    selector: 'verification-template-popup',
    templateUrl: 'verification-template-popup.component.html',
    styleUrls: ['verification-template-popup.component.scss']
})
export class VerificationTemplatePopupComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>()
    form!: UntypedFormGroup
    model: VerificationTemplate
    readonly = false
   
    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        private fb: UntypedFormBuilder,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<VerificationTemplate> & { readonly: boolean },
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
        this.form = this.fb.group(this.model.buildForm(true))
     
    }

    save() {
        const item = new VerificationTemplate().clone({
            ... this.model,
            ...this.form.getRawValue(),
        })
        this.dialogRef.close(item)
    }

   
    get verificationControl(): UntypedFormControl {
        return this.form.get('verification') as UntypedFormControl;
    }
   
}