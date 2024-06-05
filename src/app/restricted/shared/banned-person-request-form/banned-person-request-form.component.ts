import { Component, Input, OnInit, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { BannedPerson } from '@app/models/banned-person';
import { Country } from '@app/models/country';
import { CountryService } from '@app/services/country.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DatepickerControlsMap, DatepickerOptionsMap } from '@app/types/types';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-request-form',
    templateUrl: 'banned-person-request-form.component.html',
    styleUrls: ['banned-person-request-form.component.scss'],

})
export class BannedPersonRequestFormComponent implements OnInit {
    @Input() form!: UntypedFormGroup;
    @Input() readonly = false;
    ngOnInit(): void {
        this._buildDatePickerMap();
        this._buildDatepickerControlsMap();
        this.countryService.activeCountries$.subscribe(list => this.countries$.next(list));
    }


    lookupService = inject(LookupService);
    lang = inject(LangService);
    countryService = inject(CountryService)

    countries$ = new BehaviorSubject<Country[]>([]);
    sourceTypes = this.lookupService.listByCategory.SourceType;
    sourceClassifications = this.lookupService.listByCategory.SourceClassification;
    legalNatures = this.lookupService.listByCategory.LegalNature;
    documentTypes = this.lookupService.listByCategory.DocumentType;
    genders = this.lookupService.listByCategory.Gender;
    nationalities = this.lookupService.listByCategory.Nationality;
    additionStatuses = this.lookupService.listByCategory.AdditionStatus;

    datepickerOptionsMap: DatepickerOptionsMap = {};
    datepickerControlsMap: DatepickerControlsMap = {};
    private _buildDatepickerControlsMap(): void {
        this.datepickerControlsMap = {
            documentIssuanceDate: this.documentIssuanceDateControl,
            dateOfBirth: this.dateOfBirthControl,
            dateOfAdding: this.dateOfAddingControl,
        }
    }
    private _buildDatePickerMap() {
        this.datepickerOptionsMap = {
            documentIssuanceDate: DateUtils.getDatepickerOptions({
                disablePeriod: 'none',
            }),
            dateOfBirth: DateUtils.getDatepickerOptions({
                disablePeriod: 'none',
            }),
            dateOfAdding: DateUtils.getDatepickerOptions({
                disablePeriod: 'none',
            }),
        };
    }
    get documentIssuanceDateControl(): UntypedFormControl {
        return this.form.get('documentIssuanceDate') as UntypedFormControl;
    }
    get dateOfBirthControl(): UntypedFormControl {
        return this.form.get('dateOfBirth') as UntypedFormControl;
    }
    get dateOfAddingControl(): UntypedFormControl {
        return this.form.get('dateOfAdding') as UntypedFormControl;
    }
    get requestStatusControl(): UntypedFormControl {
        return this.form.get('requestStatus') as UntypedFormControl;
    }
}
