import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {Country} from '@app/models/country';
import {Lookup} from '@app/models/lookup';
import {LookupCategories} from '@app/enums/lookup-categories';
import {IKeyValue} from '@app/interfaces/i-key-value';

@Component({
  selector: 'country-popup',
  templateUrl: './country-popup.component.html',
  styleUrls: ['./country-popup.component.scss']
})
export class CountryPopupComponent implements OnInit, AfterViewInit {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: Country;
  operation: OperationTypes;
  fm!: FormManager;
  parentCountriesList: Country[];
  statusList: Lookup[];
  tabsData: IKeyValue = {
    basic: {name: 'basic', index: 0},
    cities: {name: 'cities', index: 1}
  };
  selectedTabIndex$: Subject<number> = new Subject<number>();
  saveVisible = true;
  validateFieldsVisible = true;

  selectedTabName: string;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Country>,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private fb: FormBuilder,
              public langService: LangService,
              private lookupService: LookupService) {
    this.model = data.model;
    this.operation = data.operation;
    this.parentCountriesList = data.parentCountries;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
    this.selectedTabName = data.selectedTabName;
  }

  ngOnInit(): void {
    this.langService = FactoryService.getService('LangService');
    this.buildForm();
    this._saveModel();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.tabsData.hasOwnProperty(this.selectedTabName) && this.tabsData[this.selectedTabName]) {
        this.selectedTabIndex$.next(this.tabsData[this.selectedTabName].index);
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  setDialogButtonsVisibility(tab: any): void {
    this.saveVisible = (tab.name && tab.name === this.tabsData.basic.name);
    this.validateFieldsVisible = (tab.name && tab.name === this.tabsData.basic.name);
  }

  buildForm(): void {
    let controls: IKeyValue = {
        arName: [this.model.arName, [
          CustomValidators.required, CustomValidators.maxLength(100),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM_ONE_AR')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, CustomValidators.maxLength(100),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM_ONE_ENG')
        ]],
        status: [this.model.status, [CustomValidators.required]],
        riskLevel: [this.model.riskLevel, [CustomValidators.decimal(5), CustomValidators.maxLength(10)]]
      },
      validators: string[] = ['arName', 'enName', 'status'];

    this.form = this.fb.group({
      basic: this.fb.group(controls, {
        validators: CustomValidators.validateFieldsStatus(validators)
      })
    });
    this.fm = new FormManager(this.form, this.langService);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const country = (new Country()).clone({...this.model, ...this.fm.getFormField('basic')?.value});
          return country.save().pipe(
            catchError((err) => {
              return of(null);
            })
          );
        }))
      .subscribe((result: Country | null) => {
        if (!result) {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
        this.toast.success(message.change({x: result.getName()}));
        this.model = result;
        this.operation = OperationTypes.UPDATE;
        this.dialogRef.close(this.model);
      });
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_country : this.langService.map.lbl_edit_country;
  }

}
