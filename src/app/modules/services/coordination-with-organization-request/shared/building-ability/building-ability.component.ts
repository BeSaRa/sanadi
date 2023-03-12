import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import {TrainingWay} from '@enums/training-way.enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {DateUtils} from '@helpers/date-utils';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {Lookup} from '@models/lookup';
import {DialogService} from '@services/dialog.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {RecommendedWay} from '@enums/recommended-way.enum';
import {TrainingLanguage} from '@enums/training-language-enum';
import {BuildingAbility} from '@models/building-ability';
import {Profile} from '@models/profile';

@Component({
  selector: 'building-ability',
  templateUrl: './building-ability.component.html',
  styleUrls: ['./building-ability.component.scss'],
})
export class BuildingAbilityComponent implements OnInit {
  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: FormBuilder,
              private lookup: LookupService) {
  }

  @Input() formArrayName: string = 'buildingAbilitiesList';
  @Input() orgId!: number | undefined;
  allowListUpdate: boolean = true;

  private _list: BuildingAbility[] = [];
  @Input() set list(list: BuildingAbility[]) {
    if (this.allowListUpdate) {
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

  listDataSource: BehaviorSubject<BuildingAbility[]> = new BehaviorSubject<BuildingAbility[]>([]);
  columns = this.model.DisplayedColumns;

  editIndex: number = -1;
  viewOnly: boolean = false;
  private save$: Subject<any> = new Subject<any>();

  add$: Subject<any> = new Subject<any>();
  private recordChanged$: Subject<BuildingAbility | null> =
    new Subject<BuildingAbility | null>();
  private currentRecord?: BuildingAbility;

  private destroy$: Subject<any> = new Subject<any>();
  formOpened = false;
  form!: FormGroup;
  @Input() organizationUnits: Profile[] = [];
  @Input() trainingTypes: Lookup[] = [];
  @Input() trainingLanguages: Lookup[] = [];
  @Input() trainingWays: Lookup[] = [];
  @Input() recommendedWays: Lookup[] = [];
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
  filterControl: UntypedFormControl = new UntypedFormControl('');
  showForm: boolean = false;

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
      this.formOpened = true;
      this.recordChanged$.next(new BuildingAbility());
    });
  }

  private listenToRecordChange() {
    this.recordChanged$.pipe(takeUntil(this.destroy$)).subscribe((record) => {
      if (record && this.orgId) {
        record.organizationId = this.orgId;
      }
      this.currentRecord = record || undefined;
      this.showForm = !!this.currentRecord;
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
          this.formOpened = false;
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
    this.listDataSource.next(this.list);
  }

  addAllowed(): boolean {
    return !this.readonly && !this.formOpened;
  }

  onSave() {
    if (this.readonly || this.viewOnly) {
      return;
    }
    this.save$.next();
  }

  onCancel() {
    this.resetForm();
    this.showForm = false;
    this.editIndex = -1;
  }

  private resetForm() {
    this.formOpened = false;
    this.formArray.clear();
    this.formArray.markAsUntouched();
    this.formArray.markAsPristine();
  }

  view($event: MouseEvent, record: BuildingAbility, index: number) {
    $event.preventDefault();
    this.formOpened = true;
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
    this.formOpened = true;
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

  getISOFromString(str:string |undefined){
    const arr=str?.split(/:| /).filter(x=>x !== '').map(x=>x[0] === '0'? x.substring(1): x);
    const addition=arr? arr[2] === 'AM' ? 0 :12  : 0;
    const h=arr? Number(arr[0]) + addition :0;
    const m =arr? Number(arr[1]):0;

    console.log(arr);

    console.log(addition);
    console.log(h);
    console.log(m);

    return new Date(new Date().setUTCHours(h,m)).toISOString();
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
