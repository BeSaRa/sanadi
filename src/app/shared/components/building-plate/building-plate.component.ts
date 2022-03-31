import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {LangService} from '@app/services/lang.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {CustomValidators} from '@app/validators/custom-validators';
import {BehaviorSubject} from 'rxjs';
import {CommonUtils} from '@app/helpers/common-utils';
import {delay} from 'rxjs/operators';
import {disableDebugTools} from '@angular/platform-browser';

@Component({
  selector: 'building-plate',
  templateUrl: './building-plate.component.html',
  styleUrls: ['./building-plate.component.scss']
})
export class BuildingPlateComponent implements OnInit, AfterViewInit {
  constructor(public lang: LangService,
              private fb: FormBuilder) {
  }

  form!: FormGroup;
  private fields: IKeyValue = {
    buildingNo: 'buildingNo',
    street: 'street',
    zone: 'zone'
  };

  @Input() readOnly: boolean = false;

  private _record: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  @Input() propertyMap?: { buildingNo?: string, street?: string, zone?: string };

  @Input()
  set record(value: any) {
    this._record.next(value);
  }

  get record(): any {
    return this._record.value;
  }

  requiredElementClass: string = 'text-yellow';

  ngOnInit(): void {
    this._buildForm();
    this.onRecordChange();
  }

  ngAfterViewInit() {
    /*if (this.readonly) {
      this.form.disable();
    }*/
  }

  private onRecordChange() {
    this._record.pipe(
      delay(100)
    ).subscribe((value) => {
      this._updateForm();
    })
  }

  get buildingNoField(): FormControl {
    return this.form.get('buildingNo') as FormControl;
  }

  get zoneField(): FormControl {
    return this.form.get('zone') as FormControl;
  }

  get streetField(): FormControl {
    return this.form.get('street') as FormControl;
  }

  isValidForm(): boolean {
    return this.form.valid;
  }

  private _getPropertyKey(fieldName: 'buildingNo' | 'zone' | 'street'): string {
    if (!this.propertyMap || !this.propertyMap[fieldName]) {
      return this.fields[fieldName];
    }
    return this.propertyMap[fieldName]!;
  }

  private _getFieldValue(fieldName: 'buildingNo' | 'zone' | 'street') {
    let propertyKey = this._getPropertyKey(fieldName);
    if (!this.record || !this.record.hasOwnProperty(propertyKey)) {
      return '';
    }
    return this.record[propertyKey];
  }

  private _buildForm() {
    this.form = this.fb.group({
      buildingNo: [null, [CustomValidators.required, CustomValidators.number]],
      street: [null, [CustomValidators.required, CustomValidators.number]],
      zone: [null, [CustomValidators.required, CustomValidators.number]],
    });
  }

  private _updateForm() {
    let buildingNo = this._getFieldValue('buildingNo'),
      street = this._getFieldValue('street'),
      zone = this._getFieldValue('zone');

    this.buildingNoField.setValue(buildingNo);
    this.streetField.setValue(street);
    this.zoneField.setValue(zone);
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
    }
  }

}
