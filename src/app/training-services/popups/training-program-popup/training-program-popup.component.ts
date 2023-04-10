import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {TrainingProgram} from '@app/models/training-program';
import {FormManager} from '@app/models/form-manager';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel, IMyInputFieldChanged} from 'angular-mydatepicker';
import {CustomValidators} from '@app/validators/custom-validators';
import {exhaustMap, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {Trainer} from '@app/models/trainer';
import {TrainerService} from '@app/services/trainer.service';
import {TrainingStatus} from '@app/enums/training-status';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {EmployeeService} from '@app/services/employee.service';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {ProfileService} from '@services/profile.service';
import {Profile} from '@app/models/profile';
import {TrainingProgramPartner} from '@app/models/training-program-partner';
import {TrainingProgramPartnerService} from '@app/services/training-program-partner.service';
import {CommonUtils} from '@helpers/common-utils';

@Component({
  selector: 'training-program-popup',
  templateUrl: './training-program-popup.component.html',
  styleUrls: ['./training-program-popup.component.scss']
})
export class TrainingProgramPopupComponent extends AdminGenericDialog<TrainingProgram> implements AfterViewInit {
  approve$ = new Subject<any>();
  saveAndApproveClicked = false;
  saveAndPublishClicked = false;
  publish$ = new Subject<any>();
  loadTrainers$ = new BehaviorSubject<any>(null);
  loadSelectedTrainers$ = new BehaviorSubject<any>(null);
  form!: UntypedFormGroup;
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
  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    startDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    endDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
    registerationClosureDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  hoursList = DateUtils.getHoursList();
  trainingDomains: Lookup[] = this.lookupService.listByCategory.TRAINING_DOMAIN;
  trainingTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_TYPE;
  organizationTypes: Lookup[] = this.lookupService.listByCategory.ProfileType;
  targetAudienceList: Lookup[] = this.lookupService.listByCategory.TRAINING_AUDIENCE;
  attendanceMethods: Lookup[] = this.lookupService.listByCategory.TRAINING_ATTENDENCE_METHOD;
  trainingLanguages: Lookup[] = this.lookupService.listByCategory.TRAINING_LANG;
  trainingPartnersList: TrainingProgramPartner[] = [];
  // organizations properties
  selectedOrganizationType!: number;
  selectedOrganizations: Profile[] = [];
  organizations: Profile[] = [];
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
  validateStartTrainingAndEndRegistrationDates$: Subject<void> = new Subject<void>();
  isValidPastTrainingStartDate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isValidPastRegistrationEndDate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  internalUserControls: UntypedFormControl[] = [];
  @ViewChild('dialogContent') dialogContent!: ElementRef;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<TrainingProgram>,
              public lang: LangService,
              public fb: UntypedFormBuilder,
              public lookupService: LookupService,
              public toast: ToastService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              private profileService: ProfileService,
              private trainerService: TrainerService,
              private trainingProgramPartnerService: TrainingProgramPartnerService,
              private employeeService: EmployeeService) {
    super();
    this.operation = data.operation;
    this.model = data.model;
    this.isCertification = !!data.isCertification;
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (this.operation !== OperationTypes.VIEW) {
        CommonUtils.displayFormValidity(this.form, this.dialogContent.nativeElement);
      }
    })
  }

  initPopup(): void {
    this.isInternalUser = this.employeeService.isInternalUser();
    if (this.operation == OperationTypes.UPDATE || this.operation == OperationTypes.VIEW) {
      this.loadSelectedOrganizations();
    }

    if (this.operation != OperationTypes.CREATE) {
      this.originalTrainingStartDate = this.model.startDate;
      this.originalRegisterationEndDate = this.model.registerationClosureDate;
    }

    if (this.model.status && this.model.status != this.trainingStatus.DATA_ENTERED) {
      this.registrationStartDateControl.disable();
      this.registrationStartDateControl.updateValueAndValidity();
    }

    this.loadTrainers();
    this.loadTrainingProgramPartners();
    this.loadSelectedTrainers();
    this.listenToApprove();
    // this.listenToSaveAndApprove();
    this.listenToPublish();
    this.listenToValidateStartTrainingAndEndRegistrationDates();

    if (this.isCertification || this.operation == OperationTypes.VIEW) {
      this.form.disable();
      this.form.updateValueAndValidity();
    }
  }

  getRegistrationStartDateClasses() {
    let classes
    classes = this.fm.getStatusClass('registerationStartDate');
    if (this.model.status && this.model.status != this.trainingStatus.DATA_ENTERED) {
      classes = {...classes, 'input-disabled': true};
    }
    return classes;
  }

  getRegistrationEndTrainingStartTrainingEndDatesClasses(controlName: string) {
    let classes
    classes = this.fm.getStatusClass(controlName);
    if (this.isCertification || this.operation == OperationTypes.VIEW) {
      classes = {...classes, 'input-disabled': true};
    }
    return classes;
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

  listenToValidateStartTrainingAndEndRegistrationDates() {
    this.validateStartTrainingAndEndRegistrationDates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        let registrationEndDate = DateUtils.getDateStringFromDate(this.form.get('registerationClosureDate')?.value);
        let oldRegisterationClosureDate = DateUtils.getDateStringFromDate(this.originalRegisterationEndDate);

        let trainingStartDate = DateUtils.getDateStringFromDate(this.form.get('startDate')?.value);
        let oldTrainingStartDate = DateUtils.getDateStringFromDate(this.originalTrainingStartDate);

        let today = DateUtils.getDateStringFromDate((new Date()));

        if (this.operation != OperationTypes.CREATE) {
          if (this.model.status != this.trainingStatus.DATA_ENTERED) {
            if (trainingStartDate != oldTrainingStartDate && trainingStartDate < today) {
              this.isValidPastTrainingStartDate$.next(false);
            } else {
              this.isValidPastTrainingStartDate$.next(true);
            }

            if (registrationEndDate != oldRegisterationClosureDate && registrationEndDate < today) {
              this.isValidPastRegistrationEndDate$.next(false);
            } else {
              this.isValidPastRegistrationEndDate$.next(true);
            }
          } else {
            this.isValidPastTrainingStartDate$.next(true);
            this.isValidPastRegistrationEndDate$.next(true);
          }
        } else {
          this.isValidPastTrainingStartDate$.next(true);
          this.isValidPastRegistrationEndDate$.next(true);
        }
      });
  }

  onSaveClicked() {
    this.saveAndMakeAction('no');
  }

  saveAndApprove() {
    this.saveAndMakeAction('approve');
  }

  saveAndPublish() {
    this.saveAndMakeAction('publish');
  }

  saveAndMakeAction(action: string) {
    let isValidTrainingStart = false;
    let isValidRegistrationEnd = false;
    this.validateStartTrainingAndEndRegistrationDates$.next();
    let sub = this.isValidPastTrainingStartDate$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((isValid) => {
          isValidTrainingStart = isValid;
          return this.isValidPastRegistrationEndDate$
            .pipe(takeUntil(this.destroy$));
        }))
      .subscribe((isValid) => {
        isValidRegistrationEnd = isValid;
        if (isValidTrainingStart && isValidRegistrationEnd) {
          if (action == 'approve') {
            this.saveAndApproveClicked = true;
          } else if (action == 'publish') {
            this.saveAndPublishClicked = true;
          }
          this.save$.next();
        } else {
          let message = this.getErrorDatesInPastMessage(isValidTrainingStart, isValidRegistrationEnd);
          this.dialogService.error(message);
          return;
        }
      });
    sub.unsubscribe();
  }

  getErrorDatesInPastMessage(isValidTrainingStart: boolean, isValidRegistrationEnd: boolean) {
    let message;
    !isValidTrainingStart ? message = this.lang.map.training_start_date_should_not_be_in_past : message = '';
    !isValidTrainingStart && !isValidRegistrationEnd ? message += ' <br> ' : message += '';
    !isValidRegistrationEnd ? message += this.lang.map.registration_end_date_should_not_be_in_past : message += '';

    return message;
  }

  saveAndRePublish() {
    let isValidTrainingStart = false;
    let isValidRegistrationEnd = false;
    this.validateStartTrainingAndEndRegistrationDates$.next();
    return this.isValidPastTrainingStartDate$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((isValid) => {
        isValidTrainingStart = isValid;
        return this.isValidPastRegistrationEndDate$.pipe(takeUntil(this.destroy$));
      }))
      .pipe(exhaustMap((isValid) => {
        isValidRegistrationEnd = isValid;
        return this.dialogService.confirmWithTree(this.lang.map.confirm_republish_message, {
          actionBtn: 'btn_yes',
          thirdBtn: 'btn_no',
          cancelBtn: 'btn_cancel'
        }).onAfterClose$;
      }))
      .pipe(take(1),
        exhaustMap((click: UserClickOn) => {
          let model = new TrainingProgram().clone({...this.model, ...this.form.value});
          if (click === UserClickOn.NO) {
            return of(null);
          } else if (click === UserClickOn.YES && isValidTrainingStart && isValidRegistrationEnd) {
            return this.model.editAfterPublishAndSenMail(model)
              .pipe(
                tap(() => {
                  this.dialogRef.close(this.model);
                }),
                takeUntil(this.destroy$));
          } else if (click === UserClickOn.THIRD_BTN && isValidTrainingStart && isValidRegistrationEnd) {
            return this.model.editAfterPublish(model)
              .pipe(
                tap(() => {
                  this.dialogRef.close(this.model);
                }),
                takeUntil(this.destroy$));
          } else {
            let message = this.getErrorDatesInPastMessage(isValidTrainingStart, isValidRegistrationEnd);
            this.dialogService.error(message);
            return of(null);
          }
        })
      ).subscribe();
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
    this.setRelatedDates(event, fromFieldName, toFieldName);
    this.setRelatedDates(event, 'registerationClosureDate', fromFieldName);
  }

  trainingEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationStartDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    this.setRelatedDates(event, fromFieldName, toFieldName);
  }

  registrationEndDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    this.setRelatedDates(event, fromFieldName, toFieldName);
    this.setRelatedDates(event, toFieldName, 'startDate');
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

  get trainingTopicsControl(): UntypedFormControl {
    return this.form.get('trainingTopics') as UntypedFormControl;
  }

  get durationInDaysControl(): UntypedFormControl {
    return this.form.get('durationInDays') as UntypedFormControl;
  }

  get durationInHoursControl(): UntypedFormControl {
    return this.form.get('durationInHours') as UntypedFormControl;
  }

  get averageDurationInHoursControl(): UntypedFormControl {
    return this.form.get('averageDurationInHours') as UntypedFormControl;
  }

  get trainingLangControl(): UntypedFormControl {
    return this.form.get('trainingLangParsed') as UntypedFormControl;
  }

  get numberOfSeatsControl(): UntypedFormControl {
    return this.form.get('numberOfSeats') as UntypedFormControl;
  }

  get totalTrainingCostControl(): UntypedFormControl {
    return this.form.get('totalTrainingCost') as UntypedFormControl;
  }

  get commentsControl(): UntypedFormControl {
    return this.form.get('comments') as UntypedFormControl;
  }

  get trainingStartDateControl(): UntypedFormControl {
    return this.form.get('startDate') as UntypedFormControl;
  }

  get trainingEndDateControl(): UntypedFormControl {
    return this.form.get('endDate') as UntypedFormControl;
  }

  get registrationStartDateControl(): UntypedFormControl {
    return this.form.get('registerationStartDate') as UntypedFormControl;
  }

  get registrationClosureDateControl(): UntypedFormControl {
    return this.form.get('registerationClosureDate') as UntypedFormControl;
  }

  get sessionStartTimeControl(): UntypedFormControl {
    return this.form.get('sessionStartTime') as UntypedFormControl;
  }

  get sessionEndTimeControl(): UntypedFormControl {
    return this.form.get('sessionEndTime') as UntypedFormControl;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
    if (this.operation == OperationTypes.CREATE || this.operation == OperationTypes.UPDATE && this.model.status == this.trainingStatus.DATA_ENTERED) {
      this.applyValidationForPastDatesOnAllDateInputs();
    }
    this._buildDatepickerControlsMap();
    this._handleInternalUserValidations();
  }

  private _handleInternalUserValidations(): void {
    this.internalUserControls = [
      this.trainingTopicsControl,
      this.durationInDaysControl,
      this.durationInHoursControl,
      this.averageDurationInHoursControl,
      // this.trainingLangControl,
      this.numberOfSeatsControl,
      this.totalTrainingCostControl,
      this.commentsControl
    ];
    this.internalUserControls.forEach((control) => {
      control.removeValidators(CustomValidators.required);
      control.updateValueAndValidity();
    })
  }

  beforeSave(model: TrainingProgram, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: TrainingProgram, form: UntypedFormGroup): Observable<TrainingProgram> | TrainingProgram {
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
          let currentOrg: Profile = this.organizations.find(e => e.id == org.id)!;
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

  removeOrganization(event: MouseEvent, org: Profile) {
    event.preventDefault();
    this.selectedOrganizations = this.selectedOrganizations.filter(element => element.id != org.id);
    this.model.targetOrganizationListIds = this.selectedOrganizations.map(org => org.id);
  }

  private loadSelectedOrganizations(): void {
    this.profileService.loadAsLookups()
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
    this.profileService.getProfilesByProfileType(this.selectedOrganizationType).subscribe(orgs => {
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

  loadTrainingProgramPartners(): void {
    this.trainingProgramPartnerService.loadActive()
      .subscribe(partners => {
        this.trainingPartnersList = partners;
      });
  }

  private loadTrainers(): void {
    this.loadTrainers$.subscribe(() => {
      this.trainerService.loadAsLookups()
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
