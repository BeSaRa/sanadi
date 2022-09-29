import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { TrainingWay } from '@app/enums/training-way.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Lookup } from '@app/models/lookup';
import { OrgUnit } from '@app/models/org-unit';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { RecommendedWay } from './../../../../enums/recommended-way.enum';
import { TrainingLanguage } from './../../../../enums/training-language-enum';
import { BuildingAbility } from './../../../../models/building-ability';

@Component({
  selector: 'building-ability',
  templateUrl: './building-ability.component.html',
  styleUrls: ['./building-ability.component.scss'],
})
export class BuildingAbilityComponent implements OnInit {
  constructor(
    public lang: LangService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private lookup: LookupService
  ) {}
  @Input() formArrayName: string = 'buildingAbilitiesList';
  @Input() orgId!: number | undefined;
  allowListUpdate: boolean = true;

  private _list: BuildingAbility[] = [];
  @Input() set list(list: BuildingAbility[]) {
    if (this.allowListUpdate === true) {
      this._list = list;
      this.listDataSource.next(this._list);
    }
  }
  model: BuildingAbility = new BuildingAbility();
  get list(): BuildingAbility[] {
    return this._list;
  }
  @Input() readonly: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'building_abilities';

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
  formOpend = false;
  form!: FormGroup;
  @Input() organizationUnits: OrgUnit[] = [];
  @Input() trainingTypes: Lookup[] = [];
  @Input() trainingLanguages: Lookup[] = [];
  @Input() trainingWayes: Lookup[] = [];
  @Input() recommendedWayes: Lookup[] = [];
  @Input() canUpdate: boolean = true;
  @Input() isClaimed: boolean = true;

  datepickerOptionsMap: DatepickerOptionsMap = {
    suggestedActivityDateFrom: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    suggestedActivityDateTo: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };

  get formArray(): FormArray {
    return this.form.get(this.formArrayName) as FormArray;
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToAdd();
    this.listenToRecordChange();
    this.listenToSave();

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
      this.formOpend = true;
      this.recordChanged$.next(new BuildingAbility());
    });
  }
  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      if (record && this.orgId) record.organizationId = this.orgId;
      this.currentRecord = record || undefined;
      this.updateForm(this.currentRecord);
    });
  }
  private updateForm(model: BuildingAbility | undefined) {
    const formArray = this.formArray;
    formArray.clear();
    if (model) {
      formArray.push(
        this.fb.group(new BuildingAbility().clone(model).formBuilder(true))
      );
      if (this.readonly || this.viewOnly) {
        this.formArray.disable();
      }
    }
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
          const model = new BuildingAbility().clone({
            ...this.currentRecord,
            ...form.getRawValue(),
          });
          this._updateLookups(model);
          this.formOpend = false;
          return model;
        })
      )
      .subscribe((model: BuildingAbility) => {
        if (!model) {
          return;
        }
        this._updateList(
          model,
          this.editIndex > -1 ? 'UPDATE' : 'ADD',
          this.editIndex
        );
        this.toastService.success(this.lang.map.msg_save_success);
        this.editIndex = -1;
        this.viewOnly = false;
        this.recordChanged$.next(null);
      });
  }
  private _updateLookups(model: BuildingAbility) {
    model.trainingActivityTypeInfo =
      this.lookup.listByCategory.TrainingActivityType.find(
        (x) => x.lookupKey === model.trainingActivityType
      )!.convertToAdminResult();
    model.trainingLanguageInfo =
      this.lookup.listByCategory.TrainingLanguage.find(
        (x) => x.lookupKey === model.trainingLanguage
      )!.convertToAdminResult();
    model.trainingWayInfo = this.lookup.listByCategory.TrainingWay.find(
      (x) => x.lookupKey === model.trainingWay
    )!.convertToAdminResult();
  }
  private _updateList(
    record: BuildingAbility | null,
    operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE',
    gridIndex: number = -1
  ) {
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
    return !this.readonly && !this.formOpend;
  }
  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }
  onCancel() {
    this.resetForm();
    this.editIndex = -1;
  }
  private resetForm() {
    this.formOpend = false;
    this.formArray.clear();
    this.formArray.markAsUntouched();
    this.formArray.markAsPristine();
  }
  view($event: MouseEvent, record: BuildingAbility, index: number) {
    $event.preventDefault();
    this.formOpend = true;
    this.editIndex = index;
    this.viewOnly = true;
    this.recordChanged$.next(record);
  }

  delete($event: MouseEvent, record: BuildingAbility, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService
      .confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$.pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }
  edit($event: MouseEvent, record: BuildingAbility, index: number) {
    $event.preventDefault();
    this.formOpend = true;
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.viewOnly = false;
    this.recordChanged$.next(record);
  }
  @ViewChild('otherLanguage') otherLanguageRef!: ElementRef;
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

  @ViewChild('platform') platformRef!: ElementRef;
  @ViewChild('buildingsName') buildingsNameRef!: ElementRef;
  @ViewChild('floorNo') floorNoRef!: ElementRef;
  @ViewChild('hallName') hallNameRef!: ElementRef;
  @ViewChild('streetName') streetNameRef!: ElementRef;

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
  get isRemoteTraining() {
    return this.model.trainingWay === TrainingWay.REMOTE ? false : true;
  }
  get isLiveTraining() {
    return this.model.trainingWay === TrainingWay.LIVE ? false : true;
  }

  @ViewChild('email') emailRef!: ElementRef;
  @ViewChild('otherFiltrationMethod') otherFiltrationMethodRef!: ElementRef;
  onFilterationMethodChange(recommendedWay: RecommendedWay) {
    if (recommendedWay === RecommendedWay.EMAIL) {
      this.otherFiltrationMethodRef.nativeElement.value = '';
    } else {
      this.emailRef.nativeElement.value = '';
    }
    this.model!.filtrationMethod = recommendedWay;
  }

  get isEmailFiltrationMethod() {
    return this.model.filtrationMethod === RecommendedWay.EMAIL ? false : true;
  }
  get isOtherFiltrationMethod() {
    return this.model.filtrationMethod === RecommendedWay.OTHER ? false : true;
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

  date = new Date();

  times = [
    {
      text: '00 : 00 AM',
      value: new Date(this.date.setHours(0, 0)).toISOString(),
    },
    {
      text: '00 : 30 AM',
      value: new Date(this.date.setHours(0, 30)).toISOString(),
    },
    {
      text: '01 : 00 AM',
      value: new Date(this.date.setHours(1, 0)).toISOString(),
    },
    {
      text: '01 : 30 AM',
      value: new Date(this.date.setHours(1, 30)).toISOString(),
    },
    {
      text: '02 : 00 AM',
      value: new Date(this.date.setHours(2, 0)).toISOString(),
    },
    {
      text: '02 : 30 AM',
      value: new Date(this.date.setHours(2, 30)).toISOString(),
    },
    {
      text: '03 : 00 AM',
      value: new Date(this.date.setHours(3, 0)).toISOString(),
    },
    {
      text: '03 : 30 AM',
      value: new Date(this.date.setHours(3, 30)).toISOString(),
    },
    {
      text: '04 : 00 AM',
      value: new Date(this.date.setHours(4, 0)).toISOString(),
    },
    {
      text: '04 : 30 AM',
      value: new Date(this.date.setHours(4, 30)).toISOString(),
    },
    {
      text: '05 : 00 AM',
      value: new Date(this.date.setHours(5, 0)).toISOString(),
    },
    {
      text: '05 : 30 AM',
      value: new Date(this.date.setHours(5, 30)).toISOString(),
    },
    {
      text: '06 : 00 AM',
      value: new Date(this.date.setHours(6, 0)).toISOString(),
    },
    {
      text: '06 : 30 AM',
      value: new Date(this.date.setHours(6, 30)).toISOString(),
    },
    {
      text: '07 : 00 AM',
      value: new Date(this.date.setHours(7, 0)).toISOString(),
    },
    {
      text: '07 : 30 AM',
      value: new Date(this.date.setHours(7, 30)).toISOString(),
    },
    {
      text: '08 : 00 AM',
      value: new Date(this.date.setHours(8, 0)).toISOString(),
    },
    {
      text: '08 : 30 AM',
      value: new Date(this.date.setHours(8, 30)).toISOString(),
    },
    {
      text: '09 : 00 AM',
      value: new Date(this.date.setHours(9, 0)).toISOString(),
    },
    {
      text: '09 : 30 AM',
      value: new Date(this.date.setHours(9, 30)).toISOString(),
    },
    {
      text: '10 : 00 AM',
      value: new Date(this.date.setHours(10, 0)).toISOString(),
    },
    {
      text: '10 : 30 AM',
      value: new Date(this.date.setHours(10, 30)).toISOString(),
    },
    {
      text: '11 : 00 AM',
      value: new Date(this.date.setHours(11, 0)).toISOString(),
    },
    {
      text: '11 : 30 AM',
      value: new Date(this.date.setHours(11, 30)).toISOString(),
    },
    {
      text: '12 : 00 PM',
      value: new Date(this.date.setHours(12, 0)).toISOString(),
    },
    {
      text: '12 : 30 PM',
      value: new Date(this.date.setHours(12, 30)).toISOString(),
    },
    {
      text: '01 : 00 PM',
      value: new Date(this.date.setHours(1, 0)).toISOString(),
    },
    {
      text: '01 : 30 PM',
      value: new Date(this.date.setHours(1, 30)).toISOString(),
    },
    {
      text: '02 : 00 PM',
      value: new Date(this.date.setHours(2, 0)).toISOString(),
    },
    {
      text: '02 : 30 PM',
      value: new Date(this.date.setHours(2, 30)).toISOString(),
    },
    {
      text: '03 : 00 PM',
      value: new Date(this.date.setHours(3, 0)).toISOString(),
    },
    {
      text: '03 : 30 PM',
      value: new Date(this.date.setHours(3, 30)).toISOString(),
    },
    {
      text: '04 : 00 PM',
      value: new Date(this.date.setHours(4, 0)).toISOString(),
    },
    {
      text: '04 : 30 PM',
      value: new Date(this.date.setHours(4, 30)).toISOString(),
    },
    {
      text: '05 : 00 PM',
      value: new Date(this.date.setHours(5, 0)).toISOString(),
    },
    {
      text: '05 : 30 PM',
      value: new Date(this.date.setHours(5, 30)).toISOString(),
    },
    {
      text: '06 : 00 PM',
      value: new Date(this.date.setHours(6, 0)).toISOString(),
    },
    {
      text: '06 : 30 PM',
      value: new Date(this.date.setHours(6, 30)).toISOString(),
    },
    {
      text: '07 : 00 PM',
      value: new Date(this.date.setHours(7, 0)).toISOString(),
    },
    {
      text: '07 : 30 PM',
      value: new Date(this.date.setHours(7, 30)).toISOString(),
    },
    {
      text: '08 : 00 PM',
      value: new Date(this.date.setHours(8, 0)).toISOString(),
    },
    {
      text: '08 : 30 PM',
      value: new Date(this.date.setHours(8, 30)).toISOString(),
    },
    {
      text: '09 : 00 PM',
      value: new Date(this.date.setHours(9, 0)).toISOString(),
    },
    {
      text: '09 : 30 PM',
      value: new Date(this.date.setHours(9, 30)).toISOString(),
    },
    {
      text: '10 : 00 PM',
      value: new Date(this.date.setHours(10, 0)).toISOString(),
    },
    {
      text: '10 : 30 PM',
      value: new Date(this.date.setHours(10, 30)).toISOString(),
    },
    {
      text: '11 : 00 PM',
      value: new Date(this.date.setHours(11, 0)).toISOString(),
    },
    {
      text: '11 : 30 PM',
      value: new Date(this.date.setHours(11, 30)).toISOString(),
    },
  ];
}
