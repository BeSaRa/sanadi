import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {DateUtils} from '@app/helpers/date-utils';
import {isEmptyObject, objectHasValue} from '@app/helpers/utils';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {Trainer} from '@app/models/trainer';
import { takeUntil, map } from 'rxjs/operators';
import {TrainerService} from '@app/services/trainer.service';
import {Subject} from 'rxjs';
import {ITrainingProgramCriteria} from '@app/interfaces/i-training-program-criteria';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {ProfileService} from '@services/profile.service';
import {Profile} from '@app/models/profile';

@Component({
  selector: 'filter-training-programs',
  templateUrl: './filter-training-programs.component.html',
  styleUrls: ['./filter-training-programs.component.scss']
})
export class FilterTrainingProgramsComponent implements OnInit, OnDestroy {
  destroy$: Subject<any> = new Subject<any>();
  userClick: typeof UserClickOn = UserClickOn;
  criteria: ITrainingProgramCriteria;
  form: UntypedFormGroup = {} as UntypedFormGroup;

  datepickerControlsMap: DatepickerControlsMap = {};

  datepickerOptionsMap: DatepickerOptionsMap = {
    startFromDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    startToDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationFromDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationToDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  targetAudiences: Lookup[] = this.lookupService.listByCategory.TRAINING_AUDIENCE;
  attendanceMethods: Lookup[] = this.lookupService.listByCategory.TRAINING_ATTENDENCE_METHOD;
  trainingTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_TYPE;
  statuses: Lookup[] = this.lookupService.listByCategory.TRAINING_STATUS;
  trainers: Trainer[] = [];
  organizations: Profile[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: UntypedFormBuilder,
              private dialogRef: DialogRef,
              public lang: LangService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private profileService: ProfileService,
              private trainerService: TrainerService) {
    this.criteria = data.criteria;
  }

  ngOnInit(): void {
    this._buildForm();
    this.loadOrganizations();
    this.loadTrainers();
  }

  private _buildForm() {
    this.form = this.fb.group({
      activityName: [this.criteria.activityName],
      trainingProgramFullSerial: [this.criteria.trainingProgramFullSerial],
      startFromDate: [this.criteria.startFromDate],
      startToDate: [this.criteria.startToDate],
      registerationFromDate: [this.criteria.registerationFromDate],
      registerationToDate: [this.criteria.registerationToDate],
      trainingType: [this.criteria.trainingType],
      targetOrganizationListIds: [this.criteria.targetOrganizationListIds],
      targetAudience: [this.criteria.targetAudience],
      attendenceMethod: [this.criteria.attendenceMethod],
      status: [this.criteria.status],
      trainer: [this.criteria.trainer]
    });
    this._buildDatepickerControlsMap();
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      startFromDate: this.startFromDateControl,
      startToDate: this.startToDateControl,
      registerationFromDate: this.registerationFromDateControl,
      registerationToDate: this.registerationToDateControl
    };
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
    DateUtils.setRelatedMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  private loadOrganizations(): void {
    this.profileService.loadAsLookups()
      .pipe(takeUntil(this.destroy$)).pipe(map(list => list.filter(item => item.isActive())))
      .subscribe(organizations => {
        this.organizations = organizations;
      });
  }

  private loadTrainers(): void {
    this.trainerService.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => {
        this.trainers = trainers;
      });
  }

  get startFromDateControl(): UntypedFormControl {
    return this.form.get('startFromDate') as UntypedFormControl;
  }

  get startToDateControl(): UntypedFormControl {
    return this.form.get('startToDate') as UntypedFormControl;
  }

  get registerationFromDateControl(): UntypedFormControl {
    return this.form.get('registerationFromDate') as UntypedFormControl;
  }

  get registerationToDateControl(): UntypedFormControl {
    return this.form.get('registerationToDate') as UntypedFormControl;
  }

  get hasFilterCriteria(): boolean {
    return this.form.valid && !isEmptyObject(this.form.value) && objectHasValue(this.form.value);
  }

  filterRecords(): void {
    this.dialogRef.close(this.form.value);
  }

  resetFilter(): void {
    this.dialogService.confirmWithTree(this.lang.map.msg_confirm_reset_filter_select_action, {
      actionBtn: 'btn_reset',
      cancelBtn: 'btn_cancel',
      thirdBtn: 'btn_reset_close'
    }).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES || click === UserClickOn.THIRD_BTN) {
        this.form.reset();
        if (click === UserClickOn.THIRD_BTN) {
          this.dialogRef.close({});
        }
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
