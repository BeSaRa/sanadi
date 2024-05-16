import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LicenseActivity } from '@app/models/license-activity';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, Subject, observable } from 'rxjs';
import { filter, scan, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { SelectLicenseActivityPopupComponent } from '../select-license-activity-popup/select-license-activity-popup.component';
import { InboxService } from '@app/services/inbox.service';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'license-activity-popup',
    templateUrl: 'license-activity-popup.component.html',
    styleUrls: ['license-activity-popup.component.scss']
})
export class LicenseActivityPopupComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>()
    form!: UntypedFormGroup
    model: LicenseActivity
    readonly = false
    serviceNumbers: number[] = []
    serviceControl!: UntypedFormControl;
    unknownActivityControls:UntypedFormControl[]= [];
    knownActivityControls:UntypedFormControl[]=[];
    knownToggle$: Subject<void> = new Subject()
    knownState$:Observable<boolean> = new Observable<boolean>()
    constructor(
        public lang: LangService,
        private dialogRef: DialogRef,
        private fb: UntypedFormBuilder,
        private dialog: DialogService,
        private service: LicenseActivityService,
        @Inject(DIALOG_DATA_TOKEN) private data: IDialogData<LicenseActivity> & { readonly: boolean },
        public inboxService: InboxService,
        private actualInspectionService: ActualInspectionService
    ) {

        this.model = this.data.model
        this.readonly = this.data.readonly
        this.serviceNumbers = this.inboxService.licenseServices
        this.serviceControl = new UntypedFormControl(this.serviceNumbers[0])

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
        this.unknownActivityControls=[this.activityNameControl, this.activityDescriptionControl];
        this.knownActivityControls=[this.licenseNumberControl, this.licenseTypeControl];
        this.knownState$ = this.knownToggle$.pipe(
            scan((state, _) => !state, this.model.id ? !!this.model.licenseNumber : !this.model.activityName),
            startWith(this.model.id ? !!this.model.licenseNumber : !this.model.activityName),
            tap((state) => {
                if (!state) {
                    this.addValidators(this.unknownActivityControls,[CustomValidators.required]);
                    this.removeValidators(this.knownActivityControls,[CustomValidators.required]);
                 
    
                } else {
                    this.addValidators(this.knownActivityControls,[CustomValidators.required]);
                    this.removeValidators(this.unknownActivityControls,[CustomValidators.required]);
                 
                }
            })
    
        )
        if (!this.model.licenseNumber) {
            this.knownToggle$.next()
        }
    }

    save() {
        const item = new LicenseActivity().clone({
            ... this.model,
            ...this.form.getRawValue(),
        })
        this.dialogRef.close(item)
    }

    searchForLicense() {
        this.actualInspectionService.licenseActivitiesSearch(this.serviceControl.value,)
            .pipe(
                take(1),
                switchMap((list) => {
                    return this.dialog.show<IDialogData<LicenseActivity[]>>(SelectLicenseActivityPopupComponent, {
                        model: list,
                        operation: OperationTypes.VIEW
                    }).onAfterClose$
                        .pipe(takeUntil(this.destroy$))
                        .pipe(filter((value: LicenseActivity): value is LicenseActivity => !!value))
                        .pipe(tap(item => {
                            // this.model.licenseNumber = item.licenseNumber;
                            this.licenseNumberControl.setValue(item.licenseNumber);
                            this.licenseTypeControl.setValue(item.licenseType);
                            // this.model.licenseType = item.licenseType;
                            this.model.caseType = item.licenseType
                        }))
                }),

            )
            .subscribe()
    }
    get activityNameControl(): UntypedFormControl {
        return this.form.get('activityName') as UntypedFormControl;
    }
    get activityDescriptionControl(): UntypedFormControl {
        return this.form.get('activityDescription') as UntypedFormControl;
    }
    get licenseNumberControl(): UntypedFormControl {
        return this.form.get('licenseNumber') as UntypedFormControl;
    }
    get licenseTypeControl(): UntypedFormControl {
        return this.form.get('licenseType') as UntypedFormControl;
    }

    private addValidators(controls: UntypedFormControl[], validators: ValidatorFn[]) {
        controls.forEach(control=>{
            control.addValidators(validators)
            control.updateValueAndValidity();
        })
    }
    private removeValidators(controls: UntypedFormControl[], validators: ValidatorFn[]) {
        controls.forEach(control=>{
            control.removeValidators(validators);
            control.reset();
            control.updateValueAndValidity();
        })
    }
}
