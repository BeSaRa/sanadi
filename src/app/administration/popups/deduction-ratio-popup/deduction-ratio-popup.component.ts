import {Component, Inject} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UserTypes} from '@app/enums/user-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {DeductionRatioItem} from '@app/models/deduction-ratio-item';
import {Lookup} from '@app/models/lookup';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable, of, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, pairwise, startWith, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ProjectPermitTypes} from "@app/enums/project-permit-types";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {DialogService} from "@services/dialog.service";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {CustomValidators} from "@app/validators/custom-validators";
import {GlobalSettingsService} from '@app/services/global-settings.service';

@Component({
  selector: 'deduction-ratio-popup',
  templateUrl: './deduction-ratio-popup.component.html',
  styleUrls: ['./deduction-ratio-popup.component.scss']
})
export class DeductionRatioPopupComponent extends AdminGenericDialog<DeductionRatioItem> {
  form!: UntypedFormGroup;
  model!: DeductionRatioItem;
  operation: OperationTypes;
  saveVisible = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter((x: any) => x.lookupKey !== UserTypes.INTEGRATION_USER);
  workAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea.slice().sort((a, b) => a.lookupKey - b.lookupKey)
  permitTypes: Lookup[] = this.lookupService.listByCategory.ProjectPermitType.slice().sort((a, b) => a.lookupKey - b.lookupKey)
  profileTypes: Lookup[] = this.lookupService.listByCategory.ProfileType.slice().sort((a, b) => a.lookupKey - b.lookupKey)
  maxDeductionRatio: number = this.globalSettingsService.getGlobalSettings().maxDeductionRatio;

  permitTypeChangeWarn: Subject<{ warn: boolean, oldValue: ProjectPermitTypes }> = new Subject()
  workAreaChangeWarn: Subject<{ warn: boolean, oldValue: ProjectWorkArea }> = new Subject()

  // profileList: Profile[] = [];

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<DeductionRatioItem>,
              private toast: ToastService,
              private dialog: DialogService,
              private lookupService: LookupService,
              private globalSettingsService: GlobalSettingsService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    // this._loadProfiles()
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true, this.maxDeductionRatio), {validators: [this.validateMinMax]});
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }

    this.listenToPermitTypeChanges()
    this.listenToPermitTypeWarn()
    this.listenToWorkAreaChanges()
    this.listenToWorkAreaWarn()
    this.checkWorkAreaValidator()
  }

  validateMinMax(control: AbstractControl): ValidationErrors | null {
    const minValue = control.get("minLimit")?.value;
    const maxValue = control.get("maxLimit")?.value;
    if (minValue && maxValue && +minValue > +maxValue) {
      return {'minBiggerThanMax': true}
    }
    return null
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

  get workArea(): AbstractControl {
    return this.form.get('workArea')! as AbstractControl
  }

  get permitType(): AbstractControl {
    return this.form.get('permitType') as AbstractControl
  }

  listenToWorkAreaChanges(): void {
    this.workArea.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(distinctUntilChanged())
      .pipe(startWith<number, number>(this.workArea.value))
      .pipe(pairwise())
      .pipe(map(([oldValue, newValue]: [ProjectWorkArea, ProjectWorkArea]) => {
        return {
          warn: newValue && [ProjectPermitTypes.CHARITY, ProjectPermitTypes.UNCONDITIONAL_RECEIVE].includes(this.permitType.value),
          oldValue
        }
      }))
      .subscribe(this.workAreaChangeWarn)
  }

  listenToPermitTypeChanges(): void {
    this.permitType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(distinctUntilChanged())
      .pipe(startWith<number, number>(this.permitType.value))
      .pipe(pairwise())
      .pipe(map(([oldValue, newValue]: [ProjectPermitTypes, ProjectPermitTypes]) => {
        return {
          warn: [ProjectPermitTypes.UNCONDITIONAL_RECEIVE, ProjectPermitTypes.CHARITY].includes(newValue) && !!this.workArea.value,
          oldValue
        }
      }))
      .subscribe(this.permitTypeChangeWarn)
  }

  listenToPermitTypeWarn(): void {
    this.permitTypeChangeWarn
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap(({warn, oldValue}) => {
          return warn ? this.dialog.confirm(this.lang.map.the_selected_x_not_match_with_selected_y_and_y_will_be_erased.change({
              x: this.lang.map.permit_type,
              y: this.lang.map.work_area
            }))
              .onAfterClose$.pipe(map(v => ({clearValue: v === UserClickOn.YES, oldValue})))
            : of(false).pipe(tap(() => this.checkWorkAreaValidator(true)), filter((v) => v), map(v => ({
              clearValue: v,
              oldValue
            })))
        })
      )
      .subscribe(({clearValue, oldValue}) => {
        if (clearValue) {
          this.workArea.setValue(null, {emitEvent: false})
        } else {
          this.permitType.setValue(oldValue, {emitEvent: false})
        }
        this.checkWorkAreaValidator(true)
      })
  }

  listenToWorkAreaWarn(): void {
    this.workAreaChangeWarn
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap(({warn, oldValue}) => {
          return warn ? this.dialog.confirm(this.lang.map.the_selected_x_not_match_with_selected_y_and_y_will_be_erased.change({
              x: this.lang.map.work_area,
              y: this.lang.map.permit_type
            }))
              .onAfterClose$.pipe(map(v => ({clearValue: v === UserClickOn.YES, oldValue})))
            : of(false).pipe(tap(() => this.checkWorkAreaValidator(true)), filter((v) => v), map(v => ({
              clearValue: v,
              oldValue
            })))
        })
      )
      .subscribe(({clearValue, oldValue}) => {
        if (clearValue) {
          this.permitType.setValue(null, {emitEvent: false})
        } else {
          this.workArea.setValue(oldValue, {emitEvent: false})
        }
        this.checkWorkAreaValidator()
      })
  }

  private checkWorkAreaValidator(emitEvent: boolean = false): void {
    const value: ProjectPermitTypes = this.permitType.value;
    const required = [ProjectPermitTypes.SINGLE_TYPE_PROJECT, ProjectPermitTypes.SECTIONAL_BASKET].includes(value) || !value;
    this.workArea.setValidators(required ? CustomValidators.required : null)
    this.workArea.updateValueAndValidity({emitEvent})
  }
}
