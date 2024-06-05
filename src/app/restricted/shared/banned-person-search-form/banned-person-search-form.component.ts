import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { BannedPersonSearch } from '@app/models/banned-person-search';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DatepickerOptionsMap, DatepickerControlsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-search-form',
    templateUrl: 'banned-person-search-form.component.html',
    styleUrls: ['banned-person-search-form.component.scss']
})
export class BannedPersonSearchFormComponent implements OnInit, OnDestroy {
    lang=inject(LangService);
    lookupService = inject(LookupService);


    @Input()form!: UntypedFormGroup;
    @Input()readonly = true;
    @Input()isRACAInquiry = false

    @Output() inquired = new EventEmitter<Partial<BannedPersonSearch>>();

    requestStatuses = this.lookupService.listByCategory.BannedPersonRequestStatus;
    nationalities = this.lookupService.listByCategory.Nationality;

    inquiry$ = new Subject();
    destroy$ = new Subject();

    datepickerOptionsMap: DatepickerOptionsMap = {};
    datepickerControlsMap: DatepickerControlsMap = {};

    get dateFromControl(): UntypedFormControl {
        return this.form.get('dateFrom') as UntypedFormControl;
    }
    get dateToControl(): UntypedFormControl {
        return this.form.get('dateTo') as UntypedFormControl;
    }
    ngOnInit(): void {
        this._listenToInquiry();
        this._buildDatepickerControlsMap();
        this._buildDatePickerMap();;
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.destroy$.unsubscribe();
    }
    private _listenToInquiry() {
        this.inquiry$
            .pipe(
             
                tap(_ => {
                    this.inquired.emit(this.form.getRawValue());
                    this.form.reset();
                }),
                takeUntil(this.destroy$)

            )
            .subscribe()
    }
    private _buildDatepickerControlsMap(): void {
        this.datepickerControlsMap = {
            dateFrom: this.dateFromControl,
            dateTo: this.dateToControl,
        }
    }
    private _buildDatePickerMap() {
        this.datepickerOptionsMap = {
            dateFrom: DateUtils.getDatepickerOptions({
                disablePeriod: 'none',
            }),
            dateTo: DateUtils.getDatepickerOptions({
                disablePeriod: 'none',
            }),
        };
    }

    onDateChange(
        event: IMyInputFieldChanged,
        fromFieldName: string,
        toFieldName: string
    ): void {
        DateUtils.setRelatedMinMaxDate({
            fromFieldName,
            toFieldName,
            controlOptionsMap: this.datepickerOptionsMap,
            controlsMap: this.datepickerControlsMap,
        });
    }
}
