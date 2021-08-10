import {Component, Inject, OnInit} from '@angular/core';
import {FactoryService} from '../../../services/factory.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {FormManager} from '../../../models/form-manager';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LangService} from '../../../services/lang.service';
import {LookupService} from '../../../services/lookup.service';
import {Country} from '../../../models/country';
import {Lookup} from '../../../models/lookup';
import {LookupCategories} from '../../../enums/lookup-categories';
import {IKeyValue} from '../../../interfaces/i-key-value';

@Component({
  selector: 'country-popup',
  templateUrl: './country-popup.component.html',
  styleUrls: ['./country-popup.component.scss']
})
export class CountryPopupComponent implements OnInit {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: Country;
  operation: OperationTypes;
  fm!: FormManager;
  parentCountriesList: Country[];
  statusList: Lookup[];
  isParent: boolean;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    cities: {name: 'cities'}
  };
  saveVisible = true;
  validateFieldsVisible = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Country>,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private fb: FormBuilder,
              public langService: LangService,
              private lookupService: LookupService) {
    this.model = data.model;
    this.isParent = data.isParent;
    this.operation = data.operation;
    this.parentCountriesList = data.parentCountries;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
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
    this.langService = FactoryService.getService('LangService');
    this.form = this.fb.group({
      basic: this.fb.group({
        arName: [this.model.arName, [
          CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        parentId: [{
          value: this.model.parentId,
          disabled: !this.model.id // disabled while adding
        }],
        status: [this.model.status, [CustomValidators.required]],
        riskLevel: [this.model.riskLevel, [CustomValidators.required, CustomValidators.number]]
      }, {
        validators: CustomValidators.validateFieldsStatus(['arName', 'enName', 'parentId', 'status', 'riskLevel'])
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
    if (this.isParent) {
      return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_country : this.langService.map.lbl_edit_country;
    }
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_city : this.langService.map.lbl_edit_city;
  }

}
