import { Component, Inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UserTypes } from '@app/enums/user-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { DeductionRatioItem } from '@app/models/deduction-ratio-item';
import { Lookup } from '@app/models/lookup';
import { Profile } from '@app/models/profile';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ProfileService } from '@app/services/profile.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable, of } from 'rxjs';
import {catchError, filter, map, switchMap, take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'deduction-ratio-popup',
  templateUrl: './deduction-ratio-popup.component.html',
  styleUrls: ['./deduction-ratio-popup.component.scss']
})
export class DeductionRatioPopupComponent extends AdminGenericDialog<DeductionRatioItem> {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: UntypedFormGroup;
  model!: DeductionRatioItem;
  operation: OperationTypes;
  saveVisible = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter((x:any) => x.lookupKey !== UserTypes.INTEGRATION_USER);
  workAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea
  permitTypes: Lookup[] = this.lookupService.listByCategory.ProjectPermitType
  profileTypes: Lookup[] = this.lookupService.listByCategory.ProfileType
  // profileList: Profile[] = [];

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<DeductionRatioItem>,
              private toast: ToastService,
              private lookupService: LookupService,
              // private profileService:ProfileService,
              ) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    // this._loadProfiles()
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true), { validator: this.validateMinMax });
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }
  validateMinMax(control: AbstractControl): ValidationErrors | null {
    const minValue = control.get("minLimit")?.value;
    const maxValue = control.get("maxLimit")?.value;
    if (minValue&&maxValue&& +minValue > +maxValue) { return { 'minBiggerThanMax': true } }
    return null
  }

  workAreaReadOnly(){
    const permitTypeValue = this.form.get('permitType')?.value
    return permitTypeValue == 3 || permitTypeValue == 4 
  }
  
  beforeSave(model: DeductionRatioItem, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: DeductionRatioItem, form: UntypedFormGroup): Observable<DeductionRatioItem> | DeductionRatioItem {
    return (new DeductionRatioItem()).clone({...model, ...form.value});
  }

  afterSave(model: DeductionRatioItem, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({x: this.form.controls[this.lang.map.lang + 'Name'].value}))
      : this.toast.success(message.change({x: model.getName(this.lang.map.lang)}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_deduction_ratio_item;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_deduction_ratio_item;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }
  // private _loadProfiles(): void {
  //   this.profileService.loadAsLookups()
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       catchError(() => {
  //         return of([]);
  //       })
  //     )
  //     .subscribe((result) => this.profileList = result);
  // }
  NameNotValid(){
    const arName = this.form.get('arName')
    const enName = this.form.get('enName')
    return (arName?.invalid && (arName?.dirty || arName?.touched))|| (enName?.invalid && (enName?.dirty || enName?.touched))
  }
}
