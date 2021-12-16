import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {TrainingProgram} from '@app/models/training-program';
import {FormManager} from '@app/models/form-manager';
import {FormBuilder, FormControl, FormGroup, ValidatorFn} from '@angular/forms';
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
import {IMyDateModel, IMyInputFieldChanged} from 'angular-mydatepicker';
import {CustomValidators} from '@app/validators/custom-validators';
import {OrgUnit} from '@app/models/org-unit';
import {exhaustMap, switchMap, takeUntil, tap} from 'rxjs/operators';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {Trainer} from '@app/models/trainer';
import {TrainerService} from '@app/services/trainer.service';
import {TrainingStatus} from '@app/enums/training-status';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {EmployeeService} from '@app/services/employee.service';

@Component({
  selector: 'training-program-popup',
  templateUrl: './training-program-popup.component.html',
  styleUrls: ['./training-program-popup.component.scss']
})
export class TrainingProgramPopupComponent extends AdminGenericDialog<TrainingProgram> {
  approve$ = new Subject<any>();
  saveAndApproveClicked = false;
  saveAndPublishClicked = false;
  publish$ = new Subject<any>();
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
    basic: {
      name: 'basic',
      validStatus: () => this.form && this.form.valid
    },
    organizations: {
      name: 'organizations',
      validStatus: () => this.model && this.model.targetOrganizationListIds.length < 1
    },
    trainers: {
      name: 'trainers',
      validStatus: () => this.model && this.model.trainerListIds.length < 1
    },
    briefcase: {
      name: 'briefcase',
      validStatus: () => true
    },
    passedTrainees: {
      name: 'passedTrainees',
      validStatus: () => true
    },
    attendingTrainees: {
      name: 'attendingTrainees',
      validStatus: () => true
    }
  };
  tabIndex$: Subject<number> = new Subject<number>();
  datepickerControlsMap: { [key: string]: FormControl } = {};
  datepickerOptionsMap: IKeyValue = {
    startDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    endDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  hoursList = DateUtils.getHoursList();
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
  isInternalUser!: boolean;
  isCertification!: boolean;
  originalTrainingStartDate!: string | IMyDateModel;
  originalRegisterationEndDate!: string | IMyDateModel;
  originalTrainingOpenRegistrationDate!: string | IMyDateModel;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService,
              public fb: FormBuilder,
              public exceptionHandlerService: ExceptionHandlerService,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              private organizationUnitService: OrganizationUnitService,
              private trainerService: TrainerService,
              private employeeService: EmployeeService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.isCertification = !!data.isCertification;
  }

  initPopup(): void {
    this.isInternalUser = this.employeeService.isInternalUser();
    if (this.operation == OperationTypes.UPDATE || this.operation == OperationTypes.VIEW) {
      this.loadSelectedOrganizations();
    }

    if (this.operation != OperationTypes.CREATE) {
      this.originalTrainingStartDate = this.model.startDate;
      this.originalTrainingOpenRegistrationDate = this.model.registerationStartDate;
    }

    if (this.model.status == this.trainingStatus.REGISTRATION_OPEN) {
      this.registrationStartDateControl.disable();
      this.registrationStartDateControl.updateValueAndValidity();
    }

    this.loadTrainers();
    this.loadSelectedTrainers();
    this.listenToApprove();
    // this.listenToSaveAndApprove();
    this.listenToPublish();

    if (this.isCertification || this.operation == OperationTypes.VIEW) {
      this.form.disable();
      this.form.updateValueAndValidity();
    }
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

  onSaveClicked() {
    let registrationEndDate = DateUtils.getDateStringFromDate(this.form.get('registerationClosureDate')?.value);
    let oldRegisterationClosureDate = DateUtils.getDateStringFromDate(this.originalRegisterationEndDate);
    let today = DateUtils.getDateStringFromDate((new Date()));

    if (this.operation != OperationTypes.CREATE) {
      if (this.model.status == this.trainingStatus.DATA_ENTERED) {
        if (registrationEndDate != oldRegisterationClosureDate && registrationEndDate < today) {
          this.toast.error(this.lang.map.registration_end_date_should_not_be_in_past);
          return;
        }
      }
    }
    this.save$.next();
  }

  saveAndApprove() {
    let registrationEndDate = DateUtils.getDateStringFromDate(this.form.get('registerationClosureDate')?.value);
    let oldRegisterationClosureDate = DateUtils.getDateStringFromDate(this.originalRegisterationEndDate);
    let today = DateUtils.getDateStringFromDate((new Date()));

    if (this.operation != OperationTypes.CREATE) {
      if (this.model.status == this.trainingStatus.DATA_ENTERED) {
        if (registrationEndDate != oldRegisterationClosureDate && registrationEndDate < today) {
          this.toast.error(this.lang.map.registration_end_date_should_not_be_in_past);
          return;
        }
      }
    }
    this.saveAndApproveClicked = true;
    this.save$.next();
  }

  saveAndPublish() {
    let registrationEndDate = DateUtils.getDateStringFromDate(this.form.get('registerationClosureDate')?.value);
    let oldRegisterationClosureDate = DateUtils.getDateStringFromDate(this.originalRegisterationEndDate);
    let today = DateUtils.getDateStringFromDate((new Date()));

    if (this.operation != OperationTypes.CREATE) {
      if (this.model.status == this.trainingStatus.DATA_ENTERED) {
        if (registrationEndDate != oldRegisterationClosureDate && registrationEndDate < today) {
          this.toast.error(this.lang.map.registration_end_date_should_not_be_in_past);
          return;
        }
      }
    }
    this.saveAndPublishClicked = true;
    this.save$.next();
  }

  saveAndRePublish() {
    let registrationEndDate = DateUtils.getDateStringFromDate(this.form.get('registerationClosureDate')?.value);
    let oldRegisterationClosureDate = DateUtils.getDateStringFromDate(this.originalRegisterationEndDate);
    let today = DateUtils.getDateStringFromDate((new Date()));

    if (this.operation != OperationTypes.CREATE) {
      if (this.model.status == this.trainingStatus.DATA_ENTERED) {
        if (registrationEndDate != oldRegisterationClosureDate && registrationEndDate < today) {
          this.toast.error(this.lang.map.registration_end_date_should_not_be_in_past);
          return;
        }
      }
    }

    this.dialogService.confirmWithTree('Confirmation', {actionBtn: 'btn_yes', thirdBtn: 'btn_no', cancelBtn: 'btn_cancel'})
      .onAfterClose$.subscribe((click: UserClickOn) => {
      console.log('clicked', click);
      if (click === UserClickOn.YES) {
        const sub = this.model.editAfterPublishAndSenMail().subscribe(() => {
          // @ts-ignore
          const message = this.lang.map.training_x_published_successfully.change({x: this.model.activityName});
          this.toast.success(message);
          this.dialogRef.close(this.model);
          sub.unsubscribe();
        });
      } else if (click === UserClickOn.THIRD_BTN) {
        const sub = this.model.editAfterPublish().subscribe(() => {
          // @ts-ignore
          const message = this.lang.map.training_x_published_successfully.change({x: this.model.activityName});
          this.toast.success(message);
          this.dialogRef.close(this.model);
          sub.unsubscribe();
        });
      }
    });
    // this.save$.next();
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
    let registrationClosureDate = DateUtils.changeDateFromDatepicker(this.registrationClosureDateControl.value);
    let trainingValidators: ValidatorFn[];

    if (this.operation == OperationTypes.CREATE) {
      if (registrationClosureDate && registrationClosureDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        trainingValidators = [CustomValidators.minDate(DateUtils.getDateStringFromDate(registrationClosureDate))];
      } else {
        trainingValidators = [CustomValidators.minDate((new Date().toDateString()))];
      }
    } else {
      if (registrationClosureDate) {
        trainingValidators = [CustomValidators.minDate(DateUtils.getDateStringFromDate(registrationClosureDate))];
      } else {
        trainingValidators = [];
      }
    }
    this.setTrainingStartDatesValidators(trainingValidators);
    this.setTrainingEndDatesValidators(trainingValidators);

    let trainingStartDate = event.value;
    let registrationValidators: ValidatorFn[];
    if (trainingStartDate) {
      registrationValidators = [CustomValidators.maxDate(DateUtils.getDateStringFromDate(trainingStartDate))];
    } else {
      registrationValidators = [];
    }
    this.setRegistrationEndDatesValidators(registrationValidators);

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  trainingEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    let registrationClosureDate = DateUtils.changeDateFromDatepicker(this.registrationClosureDateControl.value);
    let trainingValidators: ValidatorFn[];

    if (this.operation == OperationTypes.CREATE) {
      if (registrationClosureDate && registrationClosureDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        trainingValidators = [CustomValidators.minDate(DateUtils.getDateStringFromDate(registrationClosureDate))];
      } else {
        trainingValidators = [CustomValidators.minDate((new Date().toDateString()))];
      }
    } else {
      if (registrationClosureDate && registrationClosureDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        trainingValidators = [CustomValidators.minDate(DateUtils.getDateStringFromDate(registrationClosureDate))];
      } else {
        trainingValidators = [];
      }
    }
    this.setTrainingStartDatesValidators(trainingValidators);
    this.setTrainingEndDatesValidators(trainingValidators);

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    let trainingStartDate = DateUtils.changeDateFromDatepicker(this.trainingStartDateControl.value);
    let registrationValidators: ValidatorFn[] = [];

    if (this.operation == OperationTypes.CREATE) {
      if (trainingStartDate && trainingStartDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        registrationValidators = [CustomValidators.maxDate(DateUtils.getDateStringFromDate(trainingStartDate))];
      }
      registrationValidators = registrationValidators.concat([CustomValidators.minDate((new Date()).toDateString())]);
    } else {
      if (trainingStartDate && trainingStartDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        registrationValidators = [CustomValidators.maxDate(DateUtils.getDateStringFromDate(trainingStartDate))];
      }
    }
    this.setRegistrationStartDatesValidators(registrationValidators);
    this.setRegistrationEndDatesValidators(registrationValidators);

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    let trainingStartDate = DateUtils.changeDateFromDatepicker(this.trainingStartDateControl.value);
    let registrationValidators: ValidatorFn[] = [];
    if (this.operation == OperationTypes.CREATE) {
      if (trainingStartDate && trainingStartDate.setHours(0, 0, 0, 0) > (new Date().setHours(0, 0, 0, 0))) {
        registrationValidators = [CustomValidators.maxDate(DateUtils.getDateStringFromDate(trainingStartDate))];
      }
      registrationValidators = registrationValidators.concat([CustomValidators.minDate((new Date()).toDateString())]);
    } else {
      if (trainingStartDate) {
        registrationValidators = [CustomValidators.maxDate(DateUtils.getDateStringFromDate(trainingStartDate))];
      }
    }

    this.setRegistrationStartDatesValidators(registrationValidators);
    this.setRegistrationEndDatesValidators(registrationValidators);

    let registrationEndDate = event.value;
    let trainingValidators: ValidatorFn[];
    if (registrationEndDate) {
      trainingValidators = [CustomValidators.minDate(DateUtils.getDateStringFromDate(registrationEndDate))];
    } else {
      trainingValidators = [];
    }
    this.setTrainingStartDatesValidators(trainingValidators);

    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  setTrainingStartDatesValidators(validatorsArr: ValidatorFn[]) {
    this.trainingStartDateControl.setValidators(validatorsArr.concat(CustomValidators.required));
    this.trainingStartDateControl.updateValueAndValidity();
  }

  setTrainingEndDatesValidators(validatorsArr: ValidatorFn[]) {
    this.trainingStartDateControl.setValidators(validatorsArr.concat(CustomValidators.required));
    this.trainingStartDateControl.updateValueAndValidity();
  }

  setRegistrationStartDatesValidators(validatorsArr: ValidatorFn[]) {
    setTimeout(() => {
      this.registrationStartDateControl.setValidators([]);
      this.registrationStartDateControl.setValidators(validatorsArr.concat(CustomValidators.required));
    });
    this.registrationStartDateControl.updateValueAndValidity();
  }

  setRegistrationEndDatesValidators(validatorsArr: ValidatorFn[]) {
    this.registrationClosureDateControl.setValidators(validatorsArr.concat(CustomValidators.required));
    this.registrationClosureDateControl.updateValueAndValidity();
  }

  applyValidationForPastDatesOnAllDateInputs() {
    this.trainingStartDateControl.setValidators([CustomValidators.required, CustomValidators.minDate((new Date()).toDateString())]);
    this.trainingEndDateControl.setValidators([CustomValidators.required, CustomValidators.minDate((new Date()).toDateString())]);
    this.registrationStartDateControl.setValidators([CustomValidators.required, CustomValidators.minDate((new Date()).toDateString())]);
    this.registrationClosureDateControl.setValidators([CustomValidators.required, CustomValidators.minDate((new Date()).toDateString())]);
  }

  trainingStartTimeChange(): void {
    let sessionEndTime = this.sessionEndTimeControl.value;
    let validators = sessionEndTime ? [CustomValidators.timeEarlierThanOther(sessionEndTime)] : [];

    this.sessionStartTimeControl.setValidators([CustomValidators.required].concat(validators));
    this.sessionEndTimeControl.setValidators([CustomValidators.required].concat(validators));

    this.sessionStartTimeControl.updateValueAndValidity();
    this.sessionEndTimeControl.updateValueAndValidity();
  }

  trainingEndTimeChange(): void {
    let sessionStartTime = this.sessionStartTimeControl.value;
    let validators = sessionStartTime ? [CustomValidators.timeLaterThanOther(sessionStartTime)] : [];

    this.sessionStartTimeControl.setValidators([CustomValidators.required].concat(validators));
    this.sessionEndTimeControl.setValidators([CustomValidators.required].concat(validators));

    this.sessionStartTimeControl.updateValueAndValidity();
    this.sessionEndTimeControl.updateValueAndValidity();
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

  get sessionStartTimeControl(): FormControl {
    return this.form.get('sessionStartTime') as FormControl;
  }

  get sessionEndTimeControl(): FormControl {
    return this.form.get('sessionEndTime') as FormControl;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.operation == OperationTypes.CREATE) {
      this.applyValidationForPastDatesOnAllDateInputs();
    }
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
    if (this.isCertification || this.operation == OperationTypes.VIEW) {
      return this.lang.map.view_training_program;
    } else {
      return this.operation === OperationTypes.CREATE ?
        this.lang.map.add_training_program :
        this.lang.map.edit_training_program;
    }
  };

  destroyPopup(): void {
  }

  // Organizations functionality
  openAddOrganizations() {
    this.showAddOrganizationForm = true;
  }

  onAddOrganization() {
    if (this.selectedOrganization == -1) {
      this.organizations.forEach(org => {
        if (!this.hasDuplicatedId(org.id, this.selectedOrganizations)) {
          let currentOrg: OrgUnit = this.organizations.find(e => e.id == org.id)!;
          this.selectedOrganizations = [...this.selectedOrganizations, currentOrg];
          this.model.targetOrganizationListIds = this.selectedOrganizations.map(selctedOrg => selctedOrg.id);
          this.selectedOrganization = undefined;
        }
      });
      this.toast.success(this.lang.map.msg_added_successfully);
    } else {
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
    this.organizations = [];
    if (!this.selectedOrganizationType) {
      return;
    }
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
      this.model.status != this.trainingStatus.REGISTRATION_CLOSED &&
      this.operation != this.operationTypes.VIEW;
  }

  showSaveAndApproveButton() {
    return this.saveVisible &&
      this.model.status == this.trainingStatus.DATA_ENTERED &&
      this.operation != this.operationTypes.VIEW;
  }

  showSaveAndPublishButton() {
    return this.saveVisible &&
      this.operation != this.operationTypes.VIEW && this.model.status == this.trainingStatus.PROGRAM_APPROVED;
  }

  showSaveAndRePublishButton() {
    return this.saveVisible &&
      this.operation != this.operationTypes.VIEW &&
      (this.model.status == this.trainingStatus.TRAINING_PUBLISHED ||
        this.model.status == this.trainingStatus.EDITING_AFTER_PUBLISHING ||
        this.model.status == this.trainingStatus.REGISTRATION_OPEN ||
        this.model.status == this.trainingStatus.REGISTRATION_CLOSED);
  }

  showCancelTrainingProgramButton() {
    return this.operation != this.operationTypes.CREATE &&
      this.model.status != this.trainingStatus.TRAINING_FINISHED &&
      this.model.status != this.trainingStatus.TRAINING_CANCELED &&
      this.operation != this.operationTypes.VIEW;
  }

  showCertificateButton() {
    return this.model.status == this.trainingStatus.TRAINING_FINISHED &&
      this.operation != this.operationTypes.VIEW;
  }

  disabledShowCertificateButton() {
    return !this.model.traineeList.some(t => t.isAttended);
  }

  onSelectCertificateTemplateClicked() {
    const sub = this.model.service.openSelectCertificateTemplateDialog(this.model.id)
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap((dialogRef) => {
        return dialogRef.onAfterClose$;
      }))
      .subscribe((userClick: UserClickOn) => {
        if (userClick == UserClickOn.YES) {
          this.dialogRef.close();
        }
        sub.unsubscribe();
      });
  }
}
