import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup
} from "@angular/forms";
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { Lookup } from '@app/models/lookup';
import { OrgUnit } from "@app/models/org-unit";
import { DialogService } from "@app/services/dialog.service";
import { LangService } from "@app/services/lang.service";
import { ToastService } from "@app/services/toast.service";
import { DatepickerOptionsMap, ReadinessStatus } from "@app/types/types";
import { NgSelectComponent } from '@ng-select/ng-select';
import { IMyInputFieldChanged } from "angular-mydatepicker";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { TrainingLanguage } from './../../../../enums/training-language-enum';
import { BuildingAbility } from "./../../../../models/building-ability";

@Component({
  selector: "building-ability",
  templateUrl: "./building-ability.component.html",
  styleUrls: ["./building-ability.component.scss"],
})
export class BuildingAbilityComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder,
  ) {}
  @Input()formArrayName: string = "buildingAbilitiesList";
  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  private _list: BuildingAbility[] = [];
  @Input() set list(list: BuildingAbility[]) {
    this._list = list;
    this.listDataSource.next(this._list);
  }
  model: BuildingAbility = new BuildingAbility();
  get list(): BuildingAbility[] {
    return this._list;
  }
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = "building_abilities";

  listDataSource: BehaviorSubject<BuildingAbility[]> = new BehaviorSubject<
    BuildingAbility[]
  >([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BuildingAbility | null> =
    new Subject<BuildingAbility | null>();
  private currentRecord?: BuildingAbility;

  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;
  @Input()organizationUnits: OrgUnit[] = [];
  @Input()trainingTypes: Lookup[] = [];
  @Input() trainingLanguages: Lookup[] = [];
  @Input() trainingWayes: Lookup[] = [];
  @Input()canUpdate:boolean=true;

  datepickerOptionsMap: DatepickerOptionsMap = {
    suggestedActivityDateFrom: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
    suggestedActivityDateTo: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
  };
  
  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();
    this._setComponentReadiness("READY");
    if(this.canUpdate === false){     
      this.columns= this.columns.slice(0,this.model.DisplayedColumns.length-1);
    } 
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
 
  buildForm(): void {
    this.form = this.fb.group({
      [this.formArrayName]: this.fb.array([]),
    });
  }
  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.viewOnly = false;
      this.recordChanged$.next(new BuildingAbility());
    });
  }
  private listenToRecordChange() {
    this.recordChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((record) => {
        this.currentRecord = record || undefined;
        this.updateForm(this.currentRecord);
      });
  }
  private updateForm(model: BuildingAbility | undefined) {
    const formArray = this.formArray;
    formArray.clear();
    if (model) {
      if (this.viewOnly) {
        this._setComponentReadiness("READY");
      } else {
        this._setComponentReadiness("NOT_READY");
      }
      formArray.push(this.fb.group(model.formBuilder(true)));
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    } else {
      this._setComponentReadiness("READY");
    }
  }
  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }
  private listenToSave() {
    const form$ = this.save$.pipe(
      map(() => {
        return this.form.get(`${this.formArrayName}.0`) as AbstractControl;
      })
    );

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$.pipe(take(1))
        .subscribe(() => {
          this.form.get(this.formArrayName)?.markAllAsTouched();
        });
    });

    validForm$
      .pipe(
        takeUntil(this.destroy$),
        map(() => {
          return this.form.get(`${this.formArrayName}.0`) as FormArray;
        }),
        map((form) => {
          return new BuildingAbility()
          .clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
        })
      )
      .subscribe((model: BuildingAbility) => {
        if (!model) {
          return;
        }        
        this._updateList(
          model,
          this.editIndex > -1 ? "UPDATE" : "ADD",
          this.editIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }
  private _updateList(record: (BuildingAbility | null),
   operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }

    this.list = this.list.slice();    
    this.listDataSource.next(this.list);
    
  }
  addAllowed(): boolean {
    return !this.readonly;
  }
  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  onCancel() {
    this.resetForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
  }
  private resetForm() {
    this.formArray.clear();
    this.formArray.markAsUntouched();
    this.formArray.markAsPristine();
  }
  view($event: MouseEvent, record: BuildingAbility, index: number) {
    $event.preventDefault();
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete($event: MouseEvent, record: BuildingAbility, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
  edit($event: MouseEvent, record: BuildingAbility, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
  @ViewChild("otherLanguage") otherLanguageRef!:ElementRef;
  onTranaingLangaugeChange(trainingLanguage:TrainingLanguage){ 
    if(trainingLanguage!==TrainingLanguage.Other){
      this.otherLanguageRef.nativeElement.value=null
    }  
    this.model!.trainingLanguage=trainingLanguage
  }
  get isOtherLanguageAllowed(){
    
    return this.model.trainingLanguage===TrainingLanguage.Other? false:true;
  }

  get buildingAbilityForm() {
    return this.form.controls.buildingAbilitiesList as UntypedFormArray;
  }
  get buildingAbilityFormArray() {
    return this.buildingAbilityForm.controls['0'] as UntypedFormGroup;
  }
  get suggestedActivityDateFrom() {
    return this.buildingAbilityFormArray.controls.suggestedActivityDateFrom as UntypedFormControl;
  }
  get suggestedActivityDateTo() {
    return this.buildingAbilityFormArray.controls.suggestedActivityDateTo as UntypedFormControl;
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
  
  
  date=new Date()
  times=[
    {text:"00 : 00 AM", value:new Date(this.date.setUTCHours(0, 0)).toISOString()},
    {text:"00 : 30 AM", value:new Date(this.date.setUTCHours(0, 30)).toISOString()},
    {text:"01 : 00 AM", value:new Date(this.date.setUTCHours(1, 0)).toISOString()},
    {text:"01 : 30 AM", value:new Date(this.date.setUTCHours(1, 30)).toISOString()},
    {text:"02 : 00 AM", value:new Date(this.date.setUTCHours(2, 0)).toISOString()},
    {text:"02 : 30 AM", value:new Date(this.date.setUTCHours(2, 30)).toISOString()},
    {text:"03 : 00 AM", value:new Date(this.date.setUTCHours(3, 0)).toISOString()},
    {text:"03 : 30 AM", value:new Date(this.date.setUTCHours(3, 30)).toISOString()},
    {text:"04 : 00 AM", value:new Date(this.date.setUTCHours(4, 0)).toISOString()},
    {text:"04 : 30 AM", value:new Date(this.date.setUTCHours(4, 30)).toISOString()},
    {text:"05 : 00 AM", value:new Date(this.date.setUTCHours(5, 0)).toISOString()},
    {text:"05 : 30 AM", value:new Date(this.date.setUTCHours(5, 30)).toISOString()},
    {text:"06 : 00 AM", value:new Date(this.date.setUTCHours(6, 0)).toISOString()},
    {text:"06 : 30 AM", value:new Date(this.date.setUTCHours(6, 30)).toISOString()},
    {text:"07 : 00 AM", value:new Date(this.date.setUTCHours(7, 0)).toISOString()},
    {text:"07 : 30 AM", value:new Date(this.date.setUTCHours(7, 30)).toISOString()},
    {text:"08 : 00 AM", value:new Date(this.date.setUTCHours(8, 0)).toISOString()},
    {text:"08 : 30 AM", value:new Date(this.date.setUTCHours(8, 30)).toISOString()},
    {text:"09 : 00 AM", value:new Date(this.date.setUTCHours(9, 0)).toISOString()},
    {text:"09 : 30 AM", value:new Date(this.date.setUTCHours(9, 30)).toISOString()},
    {text:"10 : 00 AM", value:new Date(this.date.setUTCHours(10, 0)).toISOString()},
    {text:"10 : 30 AM", value:new Date(this.date.setUTCHours(10, 30)).toISOString()},
    {text:"11 : 00 AM", value:new Date(this.date.setUTCHours(11, 0)).toISOString()},
    {text:"11 : 30 AM", value:new Date(this.date.setUTCHours(11, 30)).toISOString()},
    {text:"12 : 00 PM", value:new Date(this.date.setUTCHours(12, 0)).toISOString()},
    {text:"12 : 30 PM", value:new Date(this.date.setUTCHours(12, 30)).toISOString()},
    {text:"01 : 00 PM", value:new Date(this.date.setUTCHours(1, 0)).toISOString()},
    {text:"01 : 30 PM", value:new Date(this.date.setUTCHours(1, 30)).toISOString()},
    {text:"02 : 00 PM", value:new Date(this.date.setUTCHours(2, 0)).toISOString()},
    {text:"02 : 30 PM", value:new Date(this.date.setUTCHours(2, 30)).toISOString()},
    {text:"03 : 00 PM", value:new Date(this.date.setUTCHours(3, 0)).toISOString()},
    {text:"03 : 30 PM", value:new Date(this.date.setUTCHours(3, 30)).toISOString()},
    {text:"04 : 00 PM", value:new Date(this.date.setUTCHours(4, 0)).toISOString()},
    {text:"04 : 30 PM", value:new Date(this.date.setUTCHours(4, 30)).toISOString()},
    {text:"05 : 00 PM", value:new Date(this.date.setUTCHours(5, 0)).toISOString()},
    {text:"05 : 30 PM", value:new Date(this.date.setUTCHours(5, 30)).toISOString()},
    {text:"06 : 00 PM", value:new Date(this.date.setUTCHours(6, 0)).toISOString()},
    {text:"06 : 30 PM", value:new Date(this.date.setUTCHours(6, 30)).toISOString()},
    {text:"07 : 00 PM", value:new Date(this.date.setUTCHours(7, 0)).toISOString()},
    {text:"07 : 30 PM", value:new Date(this.date.setUTCHours(7, 30)).toISOString()},
    {text:"08 : 00 PM", value:new Date(this.date.setUTCHours(8, 0)).toISOString()},
    {text:"08 : 30 PM", value:new Date(this.date.setUTCHours(8, 30)).toISOString()},
    {text:"09 : 00 PM", value:new Date(this.date.setUTCHours(9, 0)).toISOString()},
    {text:"09 : 30 PM", value:new Date(this.date.setUTCHours(9, 30)).toISOString()},
    {text:"10 : 00 PM", value:new Date(this.date.setUTCHours(10, 0)).toISOString()},
    {text:"10 : 30 PM", value:new Date(this.date.setUTCHours(10, 30)).toISOString()},
    {text:"11 : 00 PM", value:new Date(this.date.setUTCHours(11, 0)).toISOString()},
    {text:"11 : 30 PM", value:new Date(this.date.setUTCHours(11, 30)).toISOString()},
    
  ]
}
