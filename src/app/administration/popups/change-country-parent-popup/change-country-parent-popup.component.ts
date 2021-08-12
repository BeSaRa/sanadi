import {Component, Inject, OnInit} from '@angular/core';
import {Country} from '../../../models/country';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {of, Subject} from 'rxjs';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {LangService} from '../../../services/lang.service';
import {FormControl, FormGroup} from '@angular/forms';
import {CustomValidators} from '../../../validators/custom-validators';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {CountryService} from '../../../services/country.service';

@Component({
  selector: 'change-country-parent-popup',
  templateUrl: './change-country-parent-popup.component.html',
  styleUrls: ['./change-country-parent-popup.component.scss']
})
export class ChangeCountryParentPopupComponent implements OnInit {
  countries: Country[] = [];
  parentCountriesList: Country[] = [];

  parentId: FormControl = new FormControl(null, [CustomValidators.required]);

  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();

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
              catchError((err) => {
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
