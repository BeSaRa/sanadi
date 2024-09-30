import { Component, effect, forwardRef, inject, Injector, Input, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IncidentTypeEnum } from '@app/enums/incident-type-enum';
import { Incident } from '@app/models/inceident';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomValidators } from '@app/validators/custom-validators';
@Component({
    selector: 'incident-elements',
    templateUrl: 'incident-elements.component.html',
    styleUrls: ['incident-elements.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IncidentElementsComponent),
            multi: true
        }
    ]
})
export class IncidentElementsComponent implements ControlValueAccessor, OnInit, OnDestroy {

    lang = inject(LangService);
    fb = inject(FormBuilder);
    lookupService = inject(LookupService);

    incidentsTypes = this.lookupService.listByCategory.IncidentType;
    private injector = inject(Injector);
    @Input()
    readonly: boolean = false;


    value: Incident[] = [];
    destroy$ = new Subject<void>();

    formChange!: Signal<any>;
    incidentTypeChange!: Signal<number>;

    onChange!: (value: Incident[]) => void
    onTouch!: () => void
    writeValue(value: Incident[]): void {
        this.value = value ?? []
       !!value?.length && this.form.patchValue(this.value[0])

    }

    registerOnChange(fn: (value: Incident[]) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.readonly = isDisabled
    }
    form: UntypedFormGroup = this.fb.group(new Incident().buildForm(true));
    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.destroy$.unsubscribe()
    }

    ngOnInit(): void {
        
        this.formChange = toSignal(this.form.valueChanges, {
            injector: this.injector
        })
        this.incidentTypeChange = 
        toSignal(this.incidentTypeControl.valueChanges,{injector:this.injector})
        effect(() => {
            this.value = [this.formChange()];
            this.onChange(this.value);
        }, { injector: this.injector })
        effect(()=>{
            this._handelRequiredFields(this.incidentTypeChange());
        },{injector:this.injector})
    }
   
    get incidentTypeControl(): UntypedFormControl {
        return this.form.get('incidentType') as UntypedFormControl;
    }
    get incidentNumberControl(): UntypedFormControl {
        return this.form.get('incidentNumber') as UntypedFormControl;
    }
    get incidentTitleControl(): UntypedFormControl {
        return this.form.get('incidentTitle') as UntypedFormControl;
    }
    get incidentDetailsControl(): UntypedFormControl {
        return this.form.get('incidentDetails') as UntypedFormControl;
    }
    private incidentNumberDisplayKeys = [
        IncidentTypeEnum.REQUESTS,
        IncidentTypeEnum.INSPECTION_AND_AUDIT_TASKS,
        IncidentTypeEnum.FOLLOW_UPS,
        IncidentTypeEnum.LICENSES
    ]
     displayIncidentNumber(): boolean {
        return this.incidentNumberDisplayKeys.includes(this.incidentTypeChange())
    }
     incidentNumberLabel(): string {
        switch (this.incidentTypeChange()) {
            case IncidentTypeEnum.REQUESTS:
                return this.lang.map.lbl_request_number
            case IncidentTypeEnum.LICENSES:
                return this.lang.map.lbl_output_number
            case IncidentTypeEnum.FOLLOW_UPS:
                return this.lang.map.lbl_follow_up_number
            case IncidentTypeEnum.INSPECTION_AND_AUDIT_TASKS:
                return this.lang.map.lbl_inspection_task_number

            default:
                return "";
        }
    }

    private _handelRequiredFields(value:number) {
        if(value === IncidentTypeEnum.OTHER_SOURCES){
            this.incidentTitleControl.addValidators([CustomValidators.required]);
            this.incidentDetailsControl.addValidators([CustomValidators.required]);
            this.incidentNumberControl.removeValidators([CustomValidators.required]);
        }else{
            this.incidentTitleControl.removeValidators([CustomValidators.required]);
            this.incidentDetailsControl.removeValidators([CustomValidators.required]);
            this.incidentNumberControl.addValidators([CustomValidators.required]);

        }
        this.incidentTitleControl.updateValueAndValidity();
        this.incidentDetailsControl.updateValueAndValidity();
        this.incidentNumberControl.updateValueAndValidity();
    }

}
