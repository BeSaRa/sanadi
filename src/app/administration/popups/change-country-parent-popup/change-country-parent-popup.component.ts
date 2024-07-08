import { Component, Inject, OnInit } from '@angular/core';
import { Country } from '@app/models/country';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@contracts/i-dialog-data';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { of, Subject } from 'rxjs';
import { catchError, exhaustMap, takeUntil } from 'rxjs/operators';
import { LangService } from '@services/lang.service';
import { UntypedFormControl } from '@angular/forms';
import { CustomValidators } from '@app/validators/custom-validators';
import { CountryService } from '@services/country.service';

@Component({
  selector: 'change-country-parent-popup',
  templateUrl: './change-country-parent-popup.component.html',
  styleUrls: ['./change-country-parent-popup.component.scss']
})
export class ChangeCountryParentPopupComponent implements OnInit {
  countries: Country[] = [];
  parentCountriesList: Country[] = [];

  parentId: UntypedFormControl = new UntypedFormControl(null, [CustomValidators.required]);

  private save$: Subject<void> = new Subject<void>();
  private destroy$: Subject<void> = new Subject();

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Country[]>,
              public langService: LangService,
              private countryService: CountryService,
              private toast: ToastService,
              private dialogRef: DialogRef) {
    this.countries = data.countries;
    this.parentCountriesList = data.parentCountries.filter((x: Country) => x.id !== data.countries[0].parentId);
  }


  ngOnInit(): void {
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          return this.countryService.updateBulkParents(this.parentId.value, this.countries.map(x => x.id))
            .pipe(
              catchError(() => {
                return of(null);
              })
            );
        }))
      .subscribe((result: any) => {
        if (!result) {
          return;
        }
        const message = this.langService.map.msg_update_x_success;
        this.toast.success(message.change({x: this.langService.map.cities}));
        this.dialogRef.close(null);
      });
  }
}
