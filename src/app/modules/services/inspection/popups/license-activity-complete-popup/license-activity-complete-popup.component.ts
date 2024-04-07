import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LicenseActivity } from '@app/models/license-activity';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
    selector: 'license-activity-complete-popup',
    templateUrl: 'license-activity-complete-popup.component.html',
    styleUrls: ['license-activity-complete-popup.component.scss']
})
export class LicenseActivityCompletePopupComponent implements OnInit {
   
    form!: UntypedFormGroup
    model!: LicenseActivity;
    statusList = this.lookupService.listByCategory.InspectionActivityStatus;
    customValidators = CustomValidators
    constructor(
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<LicenseActivity>,
        public lang: LangService,
        private lookupService: LookupService,
        private dialogRef: DialogRef,
        private licenseActivityService:LicenseActivityService,
        private fb:FormBuilder
    ) {
        this.model = data.model
        this.form =  this.fb.group(this.model.buildCompleteActivityForm(true))
   
    }
    ngOnInit(): void {
      }
    displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
        if (!form) {
            this.form.markAllAsTouched();
        } else {
            form.markAllAsTouched();
        }

        let ele: HTMLElement | false = false;
        if (!element) {
            return;
        }
        element instanceof HTMLElement && (ele = element);
        typeof element === 'string' && (ele = document.getElementById(element) as HTMLElement);
        if (ele) {
            ele.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // noinspection JSUnusedGlobalSymbols
    markFormPristine(form?: UntypedFormGroup): void {
        form ? form.markAsPristine() : this.form.markAsPristine();
    }

    save() {
        const model = new LicenseActivity().clone({
            ...this.model,
            ...this.form.getRawValue()
        })
        this.licenseActivityService.complete(model)
        .pipe(
            take(1),
          
        ).subscribe(()=>{
            this.dialogRef.close(model);
        })
    }

}
