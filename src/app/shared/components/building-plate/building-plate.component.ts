import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {CustomValidators} from '@app/validators/custom-validators';
import {BehaviorSubject} from 'rxjs';
import {CommonUtils} from '@app/helpers/common-utils';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'building-plate',
  templateUrl: './building-plate.component.html',
  styleUrls: ['./building-plate.component.scss']
})
export class BuildingPlateComponent implements OnInit {
  @HostBinding('class') classes = 'row justify-content-center';
  constructor(public lang: LangService,
              private fb: UntypedFormBuilder) {
  }

  form!: UntypedFormGroup;
  private fields: IKeyValue = {
    buildingNo: 'buildingNo',
    street: 'street',
    zone: 'zone',
    unit: 'unit'
  };
  private fieldsRequired: IKeyValue = {
    buildingNo: true,
    street: true,
    zone: true,
    unit: true
  };

  @Input() readOnly: boolean = false;
  @Input() propertyMap?: { buildingNo?: string, street?: string, zone?: string, unit?: string };
  @Input() propertyRequiredMap?: { buildingNo?: boolean, street?: boolean, zone?: boolean, unit?: boolean };


  private _record: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  @Input()
  set record(value: any) {
    this._record.next(value);
  }

  get record(): any {
    return this._record.value;
  }

  requiredElementClass: string = 'text-yellow';
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  ngOnInit(): void {
    this._buildForm();
    this.onRecordChange();
  }

  private onRecordChange() {
    this._record.pipe(
      delay(100)
    ).subscribe(() => {
      this._updateForm();
    })
  }

  get buildingNoField(): UntypedFormControl {
    return this.form.get('buildingNo') as UntypedFormControl;
  }

  get unitField(): UntypedFormControl {
    return this.form.get('unit') as UntypedFormControl;
  }

  get zoneField(): UntypedFormControl {
    return this.form.get('zone') as UntypedFormControl;
  }

  get streetField(): UntypedFormControl {
    return this.form.get('street') as UntypedFormControl;
  }

  isValidForm(): boolean {
    return this.form.disabled ? true: this.form.valid ;
  }

  isTouchedOrDirty(): boolean {
    return this.form && (this.form.touched || this.form.dirty);
  }

  private _getPropertyKey(fieldName: 'buildingNo' | 'zone' | 'street' | 'unit'): string {
    if (CommonUtils.isEmptyObject(this.propertyMap) || !this.propertyMap![fieldName]) {
      return this.fields[fieldName];
    }
    return this.propertyMap![fieldName]!;
  }

  private _getPropertyRequired(fieldName: 'buildingNo' | 'zone' | 'street' | 'unit'): boolean {
    if (CommonUtils.isEmptyObject(this.propertyRequiredMap) || !(this.propertyRequiredMap!.hasOwnProperty(fieldName))) {
      return this.fieldsRequired[fieldName];
    }
    return this.propertyRequiredMap![fieldName]!;
  }

  private _getPropertyRequiredValidator(fieldName: 'buildingNo' | 'zone' | 'street' | 'unit'): ValidatorFn[] {
    return this._getPropertyRequired(fieldName) ? [CustomValidators.required] : [];
  }

  private _getFieldValue(fieldName: 'buildingNo' | 'zone' | 'street' | 'unit') {
    let propertyKey = this._getPropertyKey(fieldName);
    if (!this.record || !this.record.hasOwnProperty(propertyKey)) {
      return '';
    }
    return this.record[propertyKey];
  }

  private _buildForm() {
    this.form = this.fb.group({
      buildingNo: [null, (this._getPropertyRequiredValidator('buildingNo')).concat([CustomValidators.number, CustomValidators.maxLength(5)])],
      street: [null, (this._getPropertyRequiredValidator('street')).concat([CustomValidators.number, CustomValidators.maxLength(5)])],
      zone: [null, (this._getPropertyRequiredValidator('zone')).concat([CustomValidators.number, CustomValidators.maxLength(5)])],
      unit: [null, (this._getPropertyRequiredValidator('unit')).concat([CustomValidators.number, CustomValidators.maxLength(5)])]
    });
  }

  private _updateForm() {
    let buildingNo = this._getFieldValue('buildingNo'),
      street = this._getFieldValue('street'),
      zone = this._getFieldValue('zone'),
      unit = this._getFieldValue('unit');

    this.buildingNoField.setValue(buildingNo);
    this.streetField.setValue(street);
    this.zoneField.setValue(zone);
    this.unitField.setValue(unit);
  }

  resetForm() {
    this.form.reset();
    this.form.markAsPristine();
  }

  displayFormValidity() {
    CommonUtils.displayFormValidity(this.form);
  }

  getValue(): any {
    return {
      [this._getPropertyKey('buildingNo')]: this.buildingNoField.value,
      [this._getPropertyKey('zone')]: this.zoneField.value,
      [this._getPropertyKey('street')]: this.streetField.value,
      [this._getPropertyKey('unit')]: this.unitField.value,
    }
  }
  disableUpdateForExistingValues() {
    Object.values(this.form.controls).forEach(control=>{
      if(!control.value){
        control.enable();
      }else{
        control.disable();
      }
    })
  }

}
