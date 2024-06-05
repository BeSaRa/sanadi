import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AllRequestTypesEnum } from '@app/enums/all-request-types-enum';
import { BannedPerson, BannedPersonInquiry } from '@app/models/banned-person';
import { BannedPersonService } from '@app/services/banned-person.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'commission-database',
    templateUrl: 'commission-database.component.html',
    styleUrls: ['commission-database.component.scss']
})
export class CommissionDatabaseComponent implements OnInit, OnDestroy {

    fb: FormBuilder = inject(FormBuilder);
    lookupService = inject(LookupService);
    lang = inject(LangService);
    bannedPersonService = inject(BannedPersonService);
    toastService = inject(ToastService);

    save$ = new Subject();
    destroy$ = new Subject();
    form!: UntypedFormGroup;
    inquiryForm!: UntypedFormGroup;
    requestTypeControl = new UntypedFormControl(null, [CustomValidators.required]);
    readonly = true;
    model: BannedPerson = new BannedPerson();

    requestTypes = this.lookupService.listByCategory.RequestTypeNewUpdate;




    ngOnInit(): void {
        this._buildInquiryForm();
        this._buildForm();
        this._listenToSave();
        this._listenToRequestTypeChange();
        // this.model = new BannedPerson().clone({

        //     "arName": "سي",
        //     "enName": "sdf",
        //     "requestType": 1,
        //     "registrationNo": "23233",
        //     "sourceType": 1,
        //     "sourceClassification": 1,
        //     "legalNature": 2,
        //     "sourceLink": "http://localhost:4200/#/home/restricted/commission-database",
        //     "documentType": 1,
        //     "documentNumber": "123123123",
        //     "documentIssuanceDate": "2024-05-09T21:00:00.000Z",
        //     "otherIssuingCountry": "fdd",
        //     "placeOfResidence": 372,
        //     "placeOfBirth": 352,
        //     "countryId": 372,
        //     "gender": 1,
        //     "nationality": 1,
        //     "dateOfBirth": "2024-05-08T21:00:00.000Z",
        //     "dateOfAdding": "2024-05-16T21:00:00.000Z",
        //     "additionStatus": 1,
        //     "reasonsforAddition": "sdfsd",


        // }
        // )
        // this.form.patchValue(this.model)
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _buildInquiryForm() {
        this.inquiryForm = this.fb.group(new BannedPerson().buildInquiryForm());
    }
    private _buildForm() {
        this.form = this.fb.group(new BannedPerson().buildForm(true));
    }

    get additionStatusControl(): UntypedFormControl {
        return this.form.get('additionStatus') as UntypedFormControl;
    }

    get isFormValid() {
        return this.form.valid && this.requestTypeControl.valid
    }

    resetForm() {
        this.form.reset();
    }
    private _listenToSave() {
        this.save$.pipe(
            filter(_ => this.requestTypeControl.valid),
            switchMap(_ => {
                return this.bannedPersonService.create(
                    this.model.clone({
                        ...this.form.getRawValue(),
                        requestType: this.requestTypeControl.getRawValue(),
                    })
                )
            }),
            tap(_ => { this.toastService.success(this.lang.map.msg_save_success) }),
            tap(_ => { this.form.reset() }),
            takeUntil(this.destroy$),
        )
            .subscribe();
    }

    private handleRequestType(requestType: number) {
        if (requestType === AllRequestTypesEnum.NEW) {
            this.inquiryForm.disable();
        } else {
            this.inquiryForm.enable();
        }
    }
    private _listenToRequestTypeChange() {
        this.requestTypeControl.valueChanges
            .pipe(
                tap(value => { this.readonly = !value; }),
                filter(value => !!value),
                tap(value => { this.handleRequestType(value) }),
                takeUntil(this.destroy$),
            ).subscribe();
    }


    inquire(model: Partial<BannedPersonInquiry>) {
        this.bannedPersonService.getByCriteria(model)
            .pipe(
                filter(list => list.length > 0),
                switchMap(list => this.bannedPersonService.showSelectBannedPersonPopup(list).onAfterClose$),
                filter(bannedPerson => !!bannedPerson),
                tap((bannedPerson: BannedPerson) => {
                    this.model = new BannedPerson().clone(
                        { requestFullSerial: bannedPerson.requestFullSerial }
                    )
                    this.form.reset();
                    this.form.patchValue(bannedPerson)
                }),
                take(1)
            ).subscribe()
    }
}
