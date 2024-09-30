import { AfterViewInit, Component, computed, effect, forwardRef, inject, Injector, Input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LegalActionService } from '@app/services/legal-action.service';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
    selector: 'legal-actions',
    templateUrl: 'legal-actions.component.html',
    styleUrls: ['legal-actions.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LegalActionsComponent),
            multi: true
        }
    ]
})
export class LegalActionsComponent implements ControlValueAccessor {


    lang = inject(LangService);
    dialog = inject(DialogService);
    legalActionService = inject(LegalActionService);
    injector = inject(Injector);
    fb = inject(FormBuilder);
    readonly: boolean = false;


    value = signal<number | undefined>(undefined)
    legalActionList = toSignal(this.legalActionService.loadActive(), { injector: this.injector })
    control: UntypedFormControl = this.fb.control(null, [CustomValidators.required]);
    controlChanged = toSignal<number>(this.control.valueChanges, { injector: this.injector });
    selectedLegalAction = computed(() => {
        //this.onChange(this.controlChanged())
        return this.legalActionList()?.find(item => item.id === this.controlChanged())
    })

    constructor(){
        effect(() => {
            this.onChange(this.controlChanged())
        })
    }

    onChange!: (value?: number) => void
    onTouch!: () => void
    writeValue(value?: number): void {
        this.value.set(value)
        value && this.control.patchValue(value)

    }

    registerOnChange(fn: (value?: number) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.readonly = isDisabled
    }


}
