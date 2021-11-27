import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {TrainingProgram} from '@app/models/training-program';
import {FormManager} from '@app/models/form-manager';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {CustomValidators} from '@app/validators/custom-validators';
import {OrgUnit} from '@app/models/org-unit';
import {exhaustMap, takeUntil, tap} from 'rxjs/operators';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {Trainer} from '@app/models/trainer';
import {TrainerService} from '@app/services/trainer.service';
import {TrainingStatus} from '@app/enums/training-status';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'training-program-popup',
  templateUrl: './training-program-popup.component.html',
  styleUrls: ['./training-program-popup.component.scss']
})
export class TrainingProgramPopupComponent extends AdminGenericDialog<TrainingProgram> {
  approve$ = new Subject<any>();
  saveAndApprove$ = new Subject<any>();
  saveAndApproveClicked = false;
  publish$ = new Subject<any>();
  saveAndPublish$ = new Subject<any>();
  saveAndPublishClicked = false;
  loadTrainers$ = new BehaviorSubject<any>(null);
  loadSelectedTrainers$ = new BehaviorSubject<any>(null);
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: TrainingProgram;
  validateFieldsVisible = true;
  saveVisible = true;
  trainingStatus = TrainingStatus;
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    organizations: {name: 'organizations'},
    trainers: {name: 'trainers'},
    candidates: {name: 'candidates'}
  };
  datepickerControlsMap: { [key: string]: FormControl } = {};
  datepickerOptionsMap: IKeyValue = {
    startDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    endDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  trainingTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_TYPE;
  organizationTypes: Lookup[] = this.lookupService.listByCategory.OrgUnitType;
  targetAudienceList: Lookup[] = this.lookupService.listByCategory.TRAINING_AUDIENCE;
  attendanceMethods: Lookup[] = this.lookupService.listByCategory.TRAINING_ATTENDENCE_METHOD;
  trainingLanguages: Lookup[] = this.lookupService.listByCategory.TRAINING_LANG;

  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  // organizations properties
  selectedOrganizationType!: number;
  selectedOrganizations: OrgUnit[] = [];
  organizations: OrgUnit[] = [];
  selectedOrganization?: number;
  organizationColumns = ['arName', 'enName', 'actions'];
  showAddOrganizationForm = false;

  // trainers properties
  selectedTrainers: Trainer[] = [];
  trainers: Trainer[] = [];
  selectedTrainer?: number;
  trainerColumns = ['arName', 'enName', 'specialization', 'jobTitle', 'actions'];
  showAddTrainerForm = false;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              private organizationUnitService: OrganizationUnitService,
              private trainerService: TrainerService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
  }

  initPopup(): void {
    if (this.operation == OperationTypes.UPDATE) {
      this.loadSelectedOrganizations();
    }

    this.loadTrainers();
    this.loadSelectedTrainers();
    this.listenToApprove();
    // this.listenToSaveAndApprove();
    this.listenToPublish();
  }

  listenToApprove() {
    this.approve$
      .pipe(
        tap(() => this.saveAndApproveClicked = false),
        takeUntil(this.destroy$)
      )
      .pipe(exhaustMap(() => {
        return this.model.approve();
      }))
      .subscribe(() => {
        const message = this.lang.map.training_x_approved_successfully.change({x: this.model.activityName});
        this.toast.success(message);
        this.dialogRef.close(this.model);
      });
  }

  saveAndApprove() {
    this.saveAndApproveClicked = true;
    this.save$.next();
  }

  saveAndPublish() {
    this.saveAndPublishClicked = true;
    this.save$.next();
  }

  listenToPublish() {
    this.publish$
      .pipe(
        tap(() => this.saveAndPublishClicked = false),
        takeUntil(this.destroy$)
      )
      .pipe(exhaustMap(() => {
        return this.model.publish();
      }))
      .subscribe(() => {
        const message = this.lang.map.training_x_published_successfully.change({x: this.model.activityName});
        this.toast.success(message);
        this.dialogRef.close(this.model);
      });
  }

  cancelProgram(event: MouseEvent): void {
    event.preventDefault();
    // @ts-ignore
    const confirmMessage = this.lang.map.msg_confirm_cancel_x.change({x: this.model.activityName});
    this.dialogService.confirm(confirmMessage)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = this.model.cancel().subscribe(() => {
          // @ts-ignore
          const message = this.lang.map.training_x_canceled_successfully.change({x: this.model.activityName});
          this.toast.success(message);
          this.dialogRef.close(this.model);
          sub.unsubscribe();
        });
      }
    });
  }

  trainingStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {

    // to be uncommented
    let registrationClosureDate = this.registrationClosureDateControl.value;
    let trainingValidators = registrationClosureDate ? [CustomValidators.minDate(DateUtils.changeDateFromDatepicker(registrationClosureDate)!)] : [];

    let trainingStartDate = event.value;
    let registrationValidators = trainingStartDate ? [CustomValidators.maxDate(trainingStartDate)] : [];

    this.trainingStartDateControl.setValidators([CustomValidators.required].concat(trainingValidators));
    this.trainingEndDateControl.setValidators([CustomValidators.required].concat(trainingValidators));

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(registrationValidators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(registrationValidators));

    this.trainingStartDateControl.updateValueAndValidity();
    this.trainingEndDateControl.updateValueAndValidity();
    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  trainingEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    // to be uncommented
    let registrationClosureDate = this.registrationClosureDateControl.value;
    let trainingValidators = registrationClosureDate ? [CustomValidators.minDate(DateUtils.changeDateFromDatepicker(registrationClosureDate)!)] : [];

    let trainingStartDate = DateUtils.changeDateFromDatepicker(this.trainingStartDateControl.value);
    let registrationValidators = trainingStartDate ? [CustomValidators.maxDate(trainingStartDate)] : [];

    this.trainingStartDateControl.setValidators([CustomValidators.required].concat(trainingValidators));
    this.trainingEndDateControl.setValidators([CustomValidators.required].concat(trainingValidators));

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(registrationValidators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(registrationValidators));

    this.trainingStartDateControl.updateValueAndValidity();
    this.trainingEndDateControl.updateValueAndValidity();
    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    // to be uncommented
    let trainingStartDate = this.trainingStartDateControl.value;
    let validators = trainingStartDate ? [CustomValidators.maxDate(DateUtils.changeDateFromDatepicker(trainingStartDate)!)] : [];

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(validators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(validators));

    this.trainingStartDateControl.updateValueAndValidity();
    this.trainingEndDateControl.updateValueAndValidity();
    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    // to be uncommented
    let trainingStartDate = this.trainingStartDateControl.value;
    let validators = trainingStartDate ? [CustomValidators.maxDate(DateUtils.changeDateFromDatepicker(trainingStartDate)!)] : [];

    this.registrationStartDateControl.setValidators([CustomValidators.required].concat(validators));
    this.registrationClosureDateControl.setValidators([CustomValidators.required].concat(validators));

    this.trainingStartDateControl.updateValueAndValidity();
    this.trainingEndDateControl.updateValueAndValidity();
    this.registrationStartDateControl.updateValueAndValidity();
    this.registrationClosureDateControl.updateValueAndValidity();

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  setRelatedDates(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
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

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      startDate: this.trainingStartDateControl,
      endDate: this.trainingEndDateControl,
      registerationStartDate: this.registrationStartDateControl,
      registerationClosureDate: this.registrationClosureDateControl
    };
  }

  get trainingStartDateControl(): FormControl {
    return this.form.get('startDate') as FormControl;
  }

  get trainingEndDateControl(): FormControl {
    return this.form.get('endDate') as FormControl;
  }

  get registrationStartDateControl(): FormControl {
    return this.form.get('registerationStartDate') as FormControl;
  }

  get registrationClosureDateControl(): FormControl {
    return this.form.get('registerationClosureDate') as FormControl;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    this._buildDatepickerControlsMap();
  }

  beforeSave(model: TrainingProgram, form: FormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgram, form: FormGroup): Observable<TrainingProgram> | TrainingProgram {
    return (new TrainingProgram()).clone({...model, ...form.value});
  }

  afterSave(model: TrainingProgram, dialogRef: DialogRef): void {
    this.model = model;
    if (this.saveAndApproveClicked) {
      this.approve$.next();
    } else if (this.saveAndPublishClicked) {
      this.publish$.next();
    } else {
      const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
      // @ts-ignore
      this.toast.success(message.change({x: model.activityName}));
      this.dialogRef.close(this.model);
    }
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ?
      this.lang.map.add_training_program :
      this.lang.map.edit_training_program;
  };

  destroyPopup(): void {
  }

  // Organizations functionality
  openAddOrganizations() {
    this.showAddOrganizationForm = true;
  }

  addOrganization() {
    if (!this.hasDuplicatedId(this.selectedOrganization!, this.selectedOrganizations)) {
      let org = this.organizations.find(e => e.id == this.selectedOrganization)!;
      this.selectedOrganizations = [...this.selectedOrganizations, org];
      this.model.targetOrganizationListIds = this.selectedOrganizations.map(org => org.id);
      this.selectedOrganization = undefined;
      this.toast.success(this.lang.map.msg_added_x_success.change({x: org.getName()}));
      return;
    }

    this.toast.alert(this.lang.map.msg_duplicated_item);
  }

  removeOrganization(event: MouseEvent, org: OrgUnit) {
    event.preventDefault();
    this.selectedOrganizations = this.selectedOrganizations.filter(element => element.id != org.id);
    this.model.targetOrganizationListIds = this.selectedOrganizations.map(org => org.id);
  }

  private loadSelectedOrganizations(): void {
    this.organizationUnitService.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe(organizations => {
        this.selectedOrganizations = organizations.filter(element => this.model.targetOrganizationListIds.includes(element.id));
      });
  }

  onOrganizationTypeChange() {
    this.selectedOrganization = undefined;
    this.organizationUnitService.getOrganizationUnitsByOrgType(this.selectedOrganizationType).subscribe(orgs => {
      this.organizations = orgs;
    });
  }

  // trainers functionality
  openAddTrainers() {
    this.showAddTrainerForm = true;
  }

  addTrainer() {
    if (!this.hasDuplicatedId(this.selectedTrainer!, this.selectedTrainers)) {
      let trainer = this.trainers.find(e => e.id == this.selectedTrainer)!;
      this.selectedTrainers = [...this.selectedTrainers, trainer];
      this.model.trainerListIds = this.selectedTrainers.map(trainer => trainer.id);
      this.selectedTrainer = undefined;
      this.toast.success(this.lang.map.msg_added_x_success.change({x: trainer.getName()}));
      return;
    }

    this.toast.alert(this.lang.map.msg_duplicated_item);
  }

  removeTrainer(event: MouseEvent, trainer: Trainer) {
    event.preventDefault();
    this.selectedTrainers = this.selectedTrainers.filter(element => element.id != trainer.id);
    this.model.trainerListIds = this.selectedTrainers.map(trainer => trainer.id);
  }

  private loadTrainers(): void {
    this.loadTrainers$.subscribe(() => {
      this.trainerService.load()
        .pipe(takeUntil(this.destroy$))
        .subscribe(trainers => {
          this.trainers = trainers;
          this.loadSelectedTrainers$.next(null);
        });
    });
  }

  private loadSelectedTrainers(): void {
    this.loadSelectedTrainers$.subscribe(() => {
      this.selectedTrainers = this.trainers.filter(element => this.model.trainerListIds.includes(element.id));
    });
  }

  hasDuplicatedId(id: number, arr: any[]): boolean {
    return arr.some(element => element.id == id);
  }

  saveDisabled() {
    return this.form.invalid || this.model.targetOrganizationListIds.length <= 0 || this.model.trainerListIds.length <= 0;
  }

  showSaveButton() {
    return this.saveVisible &&
      this.model.status != this.trainingStatus.TRAINING_FINISHED &&
      this.model.status != this.trainingStatus.TRAINING_CANCELED &&
      this.model.status != this.trainingStatus.TRAINING_PUBLISHED &&
      this.model.status != this.trainingStatus.EDITING_AFTER_PUBLISHING &&
      this.model.status != this.trainingStatus.REGISTRATION_OPEN &&
      this.model.status != this.trainingStatus.REGISTRATION_CLOSED;
  }

  showSaveAndApproveButton() {
    return this.saveVisible && this.model.status == this.trainingStatus.DATA_ENTERED;
  }

  showSaveAndPublishButton() {
    return this.saveVisible &&
      (this.model.status ==
        this.trainingStatus.TRAINING_PUBLISHED ||
        this.model.status == this.trainingStatus.PROGRAM_APPROVED ||
        this.model.status == this.trainingStatus.EDITING_AFTER_PUBLISHING ||
        this.model.status == this.trainingStatus.REGISTRATION_OPEN ||
        this.model.status == this.trainingStatus.REGISTRATION_CLOSED);
  }

  showCancelButton() {
    return this.operation != this.operationTypes.CREATE &&
      this.model.status != this.trainingStatus.TRAINING_FINISHED &&
      this.model.status != this.trainingStatus.TRAINING_CANCELED;
  }

  hoursList: { val: number, key: string }[] = [
    {
      val: 0,
      key: '12:00 AM'
    },
    {
      val: 1,
      key: '01:00 AM'
    },
    {
      val: 2,
      key: '02:00 AM'
    },
    {
      val: 3,
      key: '03:00 AM'
    },
    {
      val: 4,
      key: '04:00 AM'
    },
    {
      val: 5,
      key: '05:00 AM'
    },
    {
      val: 6,
      key: '06:00 AM'
    },
    {
      val: 7,
      key: '07:00 AM'
    },
    {
      val: 8,
      key: '08:00 AM'
    },
    {
      val: 9,
      key: '09:00 AM'
    },
    {
      val: 10,
      key: '10:00 AM'
    },
    {
      val: 11,
      key: '11:00 AM'
    },
    {
      val: 12,
      key: '12:00 PM'
    },
    {
      val: 13,
      key: '01:00 PM'
    },
    {
      val: 14,
      key: '02:00 PM'
    },
    {
      val: 15,
      key: '03:00 PM'
    },
    {
      val: 16,
      key: '04:00 PM'
    },
    {
      val: 17,
      key: '05:00 PM'
    },
    {
      val: 18,
      key: '06:00 PM'
    },
    {
      val: 19,
      key: '07:00 PM'
    },
    {
      val: 20,
      key: '08:00 PM'
    },
    {
      val: 21,
      key: '09:00 PM'
    },
    {
      val: 22,
      key: '10:00 PM'
    },
    {
      val: 23,
      key: '11:00 PM'
    }
  ];
}
