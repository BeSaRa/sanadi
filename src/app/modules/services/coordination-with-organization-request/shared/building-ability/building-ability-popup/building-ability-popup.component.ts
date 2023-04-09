import { Lookup } from '@models/lookup';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormBuilder } from '@angular/forms';
import { BuildingAbility } from '@app/models/building-ability';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { RecommendedWay } from '@app/enums/recommended-way.enum';
import { TrainingWay } from '@app/enums/training-way.enum';
import { TrainingLanguage } from '@app/enums/training-language-enum';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { DateUtils } from '@app/helpers/date-utils';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'app-building-ability-popup',
  templateUrl: './building-ability-popup.component.html',
  styleUrls: ['./building-ability-popup.component.scss']
})
export class BuildingAbilityPopupComponent implements OnInit {

  model: BuildingAbility;
  form: UntypedFormGroup;
  editIndex: number;
  viewOnly: boolean;
  readonly: boolean;
  recommendedWays: Lookup[] = [];
  organizationUnits: Lookup[];
  trainingTypes: Lookup[];
  trainingLanguages: Lookup[];
  trainingWays: Lookup[];
  formArrayName: string;
  datepickerOptionsMap: DatepickerOptionsMap = {
    suggestedActivityDateFrom: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    suggestedActivityDateTo: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };

  @ViewChild('email') emailRef!: ElementRef;
  @ViewChild('otherFiltrationMethod') otherFiltrationMethodRef!: ElementRef;

  @ViewChild('platform') platformRef!: ElementRef;
  @ViewChild('buildingsName') buildingsNameRef!: ElementRef;
  @ViewChild('floorNo') floorNoRef!: ElementRef;
  @ViewChild('hallName') hallNameRef!: ElementRef;
  @ViewChild('streetName') streetNameRef!: ElementRef;

  @ViewChild('otherLanguage') otherLanguageRef!: ElementRef;

  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      editIndex: number,
      model: BuildingAbility,
      viewOnly: boolean,
      readonly: boolean,
      recommendedWays: Lookup[],
      organizationUnits: Lookup[],
      trainingTypes: Lookup[],
      trainingLanguages: Lookup[],
      trainingWays: Lookup[],
      formArrayName: string
    },
    public lang: LangService,
    private fb: FormBuilder,
    private dialogRef: DialogRef,
  ) {
    this.form = data.form;
    this.editIndex = data.editIndex;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.readonly = data.readonly;
    this.recommendedWays = data.recommendedWays;
    this.organizationUnits = data.organizationUnits;
    this.trainingTypes = data.trainingTypes;
    this.trainingLanguages = data.trainingLanguages;
    this.trainingWays = data.trainingWays;
    this.formArrayName = data.formArrayName;
  }

  ngOnInit() {
    const formArray = this.formArray;
    formArray.clear();
    console.log(this.model)
    if (this.model) {
      formArray.push(
        this.fb.group(new BuildingAbility().clone(this.model).formBuilder(true))
      );
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    }
  }

  onFilterationMethodChange(recommendedWay: RecommendedWay) {
    if (recommendedWay === RecommendedWay.EMAIL) {
      this.otherFiltrationMethodRef.nativeElement.value = '';
    } else {
      this.emailRef.nativeElement.value = '';
    }
    this.model!.filtrationMethod = recommendedWay;
  }
  onTranaingWayChange(trainingWay: TrainingWay) {
    if (trainingWay === TrainingWay.LIVE) {
      this.platformRef.nativeElement.value = '';
    } else {
      this.buildingsNameRef.nativeElement.value = '';
      this.floorNoRef.nativeElement.value = '';
      this.hallNameRef.nativeElement.value = '';
      this.streetNameRef.nativeElement.value = '';
    }
    this.model!.trainingWay = trainingWay;
  }

  onTranaingLangaugeChange(trainingLanguage: TrainingLanguage) {
    if (trainingLanguage !== TrainingLanguage.Other) {
      this.otherLanguageRef.nativeElement.value = '';
    }
    this.model!.trainingLanguage = trainingLanguage;
  }
  get isOtherLanguageAllowed() {
    return this.model.trainingLanguage === TrainingLanguage.Other
      ? false
      : true;
  }
  get isEmailFiltrationMethod() {
    return this.model.filtrationMethod === RecommendedWay.EMAIL ? false : true;
  }

  get isOtherFiltrationMethod() {
    return this.model.filtrationMethod === RecommendedWay.OTHER ? false : true;
  }
  get isLiveTraining() {
    return this.model.trainingWay === TrainingWay.LIVE ? false : true;
  }
  get isRemoteTraining() {
    return this.model.trainingWay === TrainingWay.REMOTE ? false : true;
  }

  onDateChange(
    event: IMyInputFieldChanged,
    fromFieldName: string,
    toFieldName: string
  ): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        suggestedActivityDateFrom: this.suggestedActivityDateFrom,
        suggestedActivityDateTo: this.suggestedActivityDateTo,
      },
    });
  }

  get buildingAbilityForm() {
    return this.form.controls.buildingAbilitiesList as UntypedFormArray;
  }
  get buildingAbilityFormArray() {
    return this.buildingAbilityForm.controls['0'] as UntypedFormGroup;
  }
  get suggestedActivityDateFrom() {
    return this.buildingAbilityFormArray.controls
      .suggestedActivityDateFrom as UntypedFormControl;
  }
  get suggestedActivityDateTo() {
    return this.buildingAbilityFormArray.controls
      .suggestedActivityDateTo as UntypedFormControl;
  }
  getISOFromString(str:string |undefined){
    const arr=str?.split(/:| /).filter(x=>x !== '').map(x=>x[0] === '0'? x.substring(1): x);
    const addition=arr? arr[2] === 'AM' ? 0 :12  : 0;
    const h=arr? Number(arr[0]) + addition :0;
    const m =arr? Number(arr[1]):0;

    return new Date(new Date().setUTCHours(h,m)).toISOString();
  }
  mapForm(form: any): BuildingAbility {
    const beneficiary: BuildingAbility = new BuildingAbility().clone(form);

    return beneficiary;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()));
  }
  times = [
    {
      text: '12 : 00 AM',
      value: '00 : 00 AM',
    },
    {
      text: '12 : 30 AM',
      value: '00 : 30 AM',
    },
    {
      text: '01 : 00 AM',
      value: '01 : 00 AM',
    },
    {
      text: '01 : 30 AM',
      value: '01 : 30 AM',
    },
    {
      text: '02 : 00 AM',
      value: '02 : 00 AM',
    },
    {
      text: '02 : 30 AM',
      value: '02 : 30 AM',
    },
    {
      text: '03 : 00 AM',
      value: '03 : 00 AM',
    },
    {
      text: '03 : 30 AM',
      value: '03 : 30 AM',
    },
    {
      text: '04 : 00 AM',
      value: '04 : 00 AM',
    },
    {
      text: '04 : 30 AM',
      value: '04 : 30 AM',
    },
    {
      text: '05 : 00 AM',
      value: '05 : 00 AM',
    },
    {
      text: '05 : 30 AM',
      value: '05 : 30 AM',
    },
    {
      text: '06 : 00 AM',
      value: '06 : 00 AM',
    },
    {
      text: '06 : 30 AM',
      value: '06 : 30 AM',
    },
    {
      text: '07 : 00 AM',
      value: '07 : 00 AM',
    },
    {
      text: '07 : 30 AM',
      value: '07 : 30 AM',
    },
    {
      text: '08 : 00 AM',
      value: '08 : 00 AM',
    },
    {
      text: '08 : 30 AM',
      value: '08 : 30 AM',
    },
    {
      text: '09 : 00 AM',
      value: '09 : 00 AM',
    },
    {
      text: '09 : 30 AM',
      value: '09 : 30 AM',
    },
    {
      text: '10 : 00 AM',
      value: '10 : 00 AM',
    },
    {
      text: '10 : 30 AM',
      value: '10 : 30 AM',
    },
    {
      text: '11 : 00 AM',
      value: '11 : 00 AM',
    },
    {
      text: '11 : 30 AM',
      value: '11 : 30 AM',
    },
    {
      text: '12 : 00 PM',
      value: '12 : 00 PM',
    },
    {
      text: '12 : 30 PM',
      value: '12 : 30 PM',
    },
    {
      text: '01 : 00 PM',
      value: '01 : 00 PM',
    },
    {
      text: '01 : 30 PM',
      value: '01 : 30 PM',
    },
    {
      text: '02 : 00 PM',
      value: '02 : 00 PM',
    },
    {
      text: '02 : 30 PM',
      value: '02 : 30 PM',
    },
    {
      text: '03 : 00 PM',
      value: '03 : 00 PM',
    },
    {
      text: '03 : 30 PM',
      value: '03 : 30 PM',
    },
    {
      text: '04 : 00 PM',
      value: '04 : 00 PM',
    },
    {
      text: '04 : 30 PM',
      value: '04 : 30 PM',
    },
    {
      text: '05 : 00 PM',
      value: '05 : 00 PM',
    },
    {
      text: '05 : 30 PM',
      value: '05 : 30 PM',
    },
    {
      text: '06 : 00 PM',
      value: '06 : 00 PM',
    },
    {
      text: '06 : 30 PM',
      value: '06 : 30 PM',
    },
    {
      text: '07 : 00 PM',
      value: '07 : 00 PM',
    },
    {
      text: '07 : 30 PM',
      value: '07 : 30 PM',
    },
    {
      text: '08 : 00 PM',
      value: '08 : 00 PM',
    },
    {
      text: '08 : 30 PM',
      value: '08 : 30 PM',
    },
    {
      text: '09 : 00 PM',
      value: '09 : 00 PM',
    },
    {
      text: '09 : 30 PM',
      value: '09 : 30 PM',
    },
    {
      text: '10 : 00 PM',
      value: '10 : 00 PM',
    },
    {
      text: '10 : 30 PM',
      value: '10 : 30 PM',
    },
    {
      text: '11 : 00 PM',
      value: '11 : 00 PM',
    },
    {
      text: '11 : 30 PM',
      value: '11 : 30 PM',
    },
  ];
}
