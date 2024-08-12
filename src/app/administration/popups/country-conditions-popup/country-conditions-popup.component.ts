import { Component, Inject, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Country } from '@app/models/country';
import { RiskLevel } from '@app/models/risk-level';
import { RiskLevelDetermination } from '@app/models/risk-level-determination';
import { LangService } from '@app/services/lang.service';
import { RiskLevelDeterminationService } from '@app/services/risk-level-determination.service';
import { RiskLevelService } from '@app/services/risk-level.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { catchError, exhaustMap, filter, isObservable, Observable, of, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'country-conditions-popup',
  templateUrl: 'country-conditions-popup.component.html',
  styleUrls: ['country-conditions-popup.component.scss']
})
export class CountryConditionsPopupComponent extends AdminGenericDialog<Country> {

  form!: UntypedFormGroup;
  model!: Country;
  operation: OperationTypes;
  saveVisible = true;


  dialogRef = inject(DialogRef);
  fb = inject(UntypedFormBuilder);
  lang = inject(LangService);
  toast = inject(ToastService);
  riskLevelService = inject(RiskLevelService);
  riskLevelDeterminationService = inject(RiskLevelDeterminationService);

  riskLevels: RiskLevel[] = []

  get selectedRiskLevel(){
   return this.riskLevels.find(item=>item.id === this.riskLevelControl.value)
  }
  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Country>,) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.riskLevelService.loadActive()
      .pipe(tap(list => this.riskLevels = list))
      .subscribe()

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildCountryConditionsForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
    //this._listenToRiskLevel()
  }

  beforeSave(model: Country, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Country, form: UntypedFormGroup): Observable<Country> | Country {
    return (new Country()).clone({ ...model, ...form.value });
  }

  afterSave(model: Country, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_request_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: this.lang.map.lbl_risk_level}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_country;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }

  listenToSave() {
    this.save$
      // call before Save callback
      .pipe(switchMap(() => {
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: Country) => {
        return this.riskLevelDeterminationService.add(RiskLevelDetermination.MapFromCountry(model))
      }))
      .subscribe(_ => {
        // this.afterSave(model, this.dialogRef);
        this.toast.success(this.lang.map.msg_save_success);
        this.dialogRef.close(true)
      });
  }
  get riskLevelControl(): UntypedFormControl {
    return this.form.get('riskLevel') as UntypedFormControl;
  }
  // private _listenToRiskLevel() {
  //   this.riskLevelControl.valueChanges
  //   .pipe(
  //     tap(id=>{
  //       this.selectedRiskLevel = this.riskLevels.find(item=>item.id ===id)
  //     }),
  //     takeUntil(this.destroy$)
  //   ).subscribe()
  // }
}