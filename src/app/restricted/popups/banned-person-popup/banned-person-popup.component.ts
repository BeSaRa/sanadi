import { Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { BannedPerson } from '@app/models/banned-person';
import { BannedPersonService } from '@app/services/banned-person.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Subject } from 'rxjs';
import { concatMap, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-popup',
    templateUrl: 'banned-person-popup.component.html',
    styleUrls: ['banned-person-popup.component.scss']
})
export class BannedPersonPopupComponent implements OnInit , OnDestroy{

    fb = inject(FormBuilder);
    lang = inject(LangService);
    bannedPersonService = inject(BannedPersonService);
    toast = inject(ToastService);
    dialogRef = inject(DialogRef);

    model!: BannedPerson;
    form!: UntypedFormGroup;
    operation!: OperationTypes;
    readonly = false;
    validateFieldsVisible= true;
    saveVisible=true;
    save$:Subject<void> = new Subject<void>();
    destroy$:Subject<void> = new Subject<void>();

    get popupTitle(): string {
        return this.lang.map.view
    }

    constructor(
        @Inject(DIALOG_DATA_TOKEN) data: IDialogData<BannedPerson>,
    ) {
        this.model = data.model;
        this.operation = data.operation
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    ngOnInit(): void {
        this.form = this.fb.group(this.model.buildForm(true));
        this.readonly = this.operation === OperationTypes.VIEW;
        this.saveVisible  =this.validateFieldsVisible = this.operation !== OperationTypes.VIEW;
        this._listenToSave();

    }
    private _listenToSave(){
        this.save$
        .pipe(
            filter(_=>!!this.model),
            concatMap(_=>this.bannedPersonService.update(this.model.clone(this.form.getRawValue()))),
            tap(_=> {this.toast.success(this.lang.map.msg_save_success)}),
            tap(_=> {this.dialogRef.close(this.model)}),
            takeUntil(this.destroy$)
        )
        .subscribe();
    }
}
