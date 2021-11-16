import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {IAngularMyDpOptions, IMyInputFieldChanged} from 'angular-mydatepicker';
import {DateUtils} from '@app/helpers/date-utils';
import {isEmptyObject, objectHasValue} from '@app/helpers/utils';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {Trainer} from '@app/models/trainer';
import {OrgUnit} from '@app/models/org-unit';
import {takeUntil} from 'rxjs/operators';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {TrainerService} from '@app/services/trainer.service';
import {Subject} from 'rxjs';
import {ITrainingProgramCriteria} from '@app/interfaces/i-training-program-criteria';

@Component({
  selector: 'filter-training-programs',
  templateUrl: './filter-training-programs.component.html',
  styleUrls: ['./filter-training-programs.component.scss']
})
export class FilterTrainingProgramsComponent implements OnInit, OnDestroy {
  destroy$: Subject<any> = new Subject<any>();
  userClick: typeof UserClickOn = UserClickOn;
  criteria: ITrainingProgramCriteria;
  form: FormGroup = {} as FormGroup;

  datepickerControlsMap: { [key: string]: FormControl } = {};

  datepickerOptionsMap: { [key: string]: IAngularMyDpOptions } = {
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
  organizations: OrgUnit[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) public data: any,
              private fb: FormBuilder,
              private dialogRef: DialogRef,
              public lang: LangService,
              private dialogService: DialogService,
              public lookupService: LookupService,
              private organizationUnitService: OrganizationUnitService,
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
    this.organizationUnitService.load()
      .pipe(takeUntil(this.destroy$))
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

  get startFromDateControl(): FormControl {
    return this.form.get('startFromDate') as FormControl;
  }

  get startToDateControl(): FormControl {
    return this.form.get('startToDate') as FormControl;
  }

  get registerationFromDateControl(): FormControl {
    return this.form.get('registerationFromDate') as FormControl;
  }

  get registerationToDateControl(): FormControl {
    return this.form.get('registerationToDate') as FormControl;
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
