import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BannedPersonInquiry } from '@app/models/banned-person';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'banned-person-inquiry-form',
    templateUrl: 'banned-person-inquiry-form.component.html',
    styleUrls: ['banned-person-inquiry-form.component.scss']
})
export class BannedPersonInquiryFormComponent implements OnInit, OnDestroy {
   
   

    lang=inject(LangService);
    lookupService = inject(LookupService);


    @Input()form!: UntypedFormGroup;
    @Input()readonly = true;

    @Output() inquired = new EventEmitter<Partial<BannedPersonInquiry>>();

    documentTypes = this.lookupService.listByCategory.DocumentType;
    nationalities = this.lookupService.listByCategory.Nationality;

    inquiry$ = new Subject();
    destroy$ = new Subject();

    ngOnInit(): void {
        this._listenToInquiry();
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
}
