import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {of, Subject} from 'rxjs';
import {InternalUser} from '@app/models/internal-user';
import {OrgUser} from '@app/models/org-user';
import {Trainer} from '@app/models/trainer';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {exhaustMap, switchMap, takeUntil, tap} from 'rxjs/operators';
import {InternalUserService} from '@app/services/internal-user.service';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {OrgUnit} from '@app/models/org-unit';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {Trainee} from '@app/models/trainee';
import {TraineeService} from '@app/services/trainee.service';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {EmployeeService} from '@app/services/employee.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'training-program-add-candidate-popup',
  templateUrl: './training-program-trainee-popup.component.html',
  styleUrls: ['./training-program-trainee-popup.component.scss']
})
export class TrainingProgramTraineePopupComponent implements OnInit, OnDestroy {
  destroy$: Subject<void> = new Subject();
  employeeTypeChanged$: Subject<string> = new Subject<string>();
  loadAuthorityUsers$: Subject<void> = new Subject<void>();
  loadOrganizations$: Subject<void> = new Subject<void>();
  loadOrganizationUsers$: Subject<void> = new Subject<void>();
  selectAuthorityUser$: Subject<void> = new Subject<void>();
  selectOrganizationUser$: Subject<void> = new Subject<void>();
  saveCandidate$: Subject<boolean> = new Subject<boolean>();
  acceptCandidate$: Subject<any> = new Subject<any>();
  employeeType: string = 'organization';
  authorityUsers: InternalUser[] = [];
  selectedAuthorityUserId?: number;
  organizations: OrgUnit[] = [];
  organizationUsers: OrgUser[] = [];
  selectedOrganizationUserId?: number;
  selectedOrganizationId?: number;
  trainer!: Trainer;
  form!: FormGroup;
  fm!: FormManager;
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  jobTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_JOB_TYPE;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  trainingProgramId!: number;
  operation!: OperationTypes;
  forceClose = false;
  model!: Trainee;
  rejectionComment: string = '';
  operationTypes = OperationTypes;
  isInternalUser!: boolean;

  constructor(
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Trainee>,
    public lang: LangService,
    public toast: ToastService,
    public dialogRef: DialogRef,
    public fb: FormBuilder,
    private internalUserService: InternalUserService,
    private organizationUnitService: OrganizationUnitService,
    private organizationUserService: OrganizationUserService,
    private lookupService: LookupService,
    private traineeService: TraineeService,
    public employeeService: EmployeeService) {
    this.model = data.model;
    this.trainingProgramId = data.trainingProgramId;
    this.operation = data.operation;
  }

  ngOnInit(): void {
    this.isInternalUser = this.employeeService.isInternalUser();
    this.listenToLoadAuthorityUsers();
    this.listenToLoadOrganizations();
    this.listenToLoadOrganizationUsers();
    this.listenToSelectAuthorityUser();
    this.listenToSelectOrganizationUser();
    this.listenToSaveCandidate();
    this.listenToEmployeeTypeChange();
    this.listenToAcceptTrainee();
    this.buildForm();

    if (!this.isInternalUser && this.operation == OperationTypes.CREATE) {
      this.selectedOrganizationId = this.employeeService.getOrgUnit()?.id!;
      this.loadOrganizationUsers$.next();
    } else if (this.isInternalUser && this.operation == OperationTypes.CREATE) {
      this.loadOrganizations$.next();
    }

    if (this.operation != OperationTypes.CREATE) {
      this.mapTraineeToForm(this.model);
    }

    if (this.operation == OperationTypes.VIEW) {
      this.form.disable();
    }
  }

  buildForm() {
    this.form = this.fb.group({
      id: this.operation == OperationTypes.CREATE ? null : this.model?.id,
      generalUserId: this.model?.generalUserId,
      arName: [this.model?.arName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.pattern('AR_NUM')
      ]],
      enName: [this.model?.enName, [CustomValidators.required,
        CustomValidators.maxLength(200),
        CustomValidators.pattern('ENG_NUM')
      ]],
      jobType: [this.model?.jobType, [CustomValidators.required,
        CustomValidators.maxLength(200)]],
      department: [this.model?.department, [CustomValidators.required,
        CustomValidators.maxLength(200)
      ]],
      trainingRecord: [this.model?.trainingRecord, [CustomValidators.maxLength(200)]],
      currentJob: [this.model?.currentJob, [CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
      ]],
      employementPosition: [this.model?.employementPosition, [CustomValidators.required]],
      email: [this.model?.email, [CustomValidators.required,
        CustomValidators.maxLength(200),
        Validators.email]],
      phoneNumber: [this.model?.phoneNumber, [CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      gender: [this.model?.gender, [CustomValidators.required]],
      nationality: [this.model?.nationality, [CustomValidators.required]]
    });
  }

  onEmployeeTypeChange() {
    this.form.reset();
    this.employeeTypeChanged$.next(this.employeeType);
  }

  listenToEmployeeTypeChange() {
    this.employeeTypeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.selectedAuthorityUserId = undefined;
        this.selectedOrganizationId = undefined;
        this.selectedOrganizationUserId = undefined;
        type == 'authority' ? this.loadAuthorityUsers$.next() : this.loadOrganizations$.next();
      });
  }

  listenToLoadAuthorityUsers() {
    this.loadAuthorityUsers$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.internalUserService.loadComposite();
      }))
      .subscribe((users) => {
        this.authorityUsers = users;
      });
  }

  listenToLoadOrganizations() {
    this.loadOrganizations$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        return this.organizationUnitService.loadComposite();
      }))
      .subscribe((organizations) => {
        this.organizations = organizations;
      });
  }

  onOrganizationChange() {
    this.form.reset();
    this.selectedOrganizationUserId = undefined;
    this.loadOrganizationUsers$.next();
  }

  listenToLoadOrganizationUsers() {
    this.loadOrganizationUsers$
      .pipe(tap(() => {
        this.organizationUsers = [];
      }))
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        if (this.selectedOrganizationId != null) {
          return this.organizationUserService.getByCriteria({'org-id': this.selectedOrganizationId});
        } else {
          return of([]);
        }
      }))
      .subscribe((users) => {
        this.organizationUsers = users;
      });
  }

  onSelectAuthorityUser() {
    this.selectAuthorityUser$.next();
  }

  onSelectOrganizationUser() {
    this.selectOrganizationUser$.next();
  }

  listenToSelectAuthorityUser() {
    this.selectAuthorityUser$.subscribe(() => {
      this.form.reset();
      const user = this.authorityUsers.find(x => x.id == this.selectedAuthorityUserId)!;
      this.mapUserToForm(user);
    });
  }

  listenToSelectOrganizationUser() {
    this.selectOrganizationUser$.subscribe(() => {
      this.form.reset();
      const user = this.organizationUsers.find(x => x.id == this.selectedOrganizationUserId)!;
      this.mapUserToForm(user);
      console.log('selected org user', this.selectedOrganizationUserId);
    });
  }

  listenToSaveCandidate() {
    this.saveCandidate$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((isDraft: boolean) => {
        const trainee = (new Trainee()).clone({...this.form.value});
        trainee.externalOrgId = this.selectedOrganizationId!;
        trainee.isDraft = isDraft;

        return this.operation == OperationTypes.CREATE ?
          this.traineeService.enrollTrainee(this.trainingProgramId, trainee) :
          this.traineeService.updateTrainee(this.trainingProgramId, trainee);
      }))
      .subscribe(() => {
        const message = this.lang.map.msg_save_success;
        this.toast.success(message);
        this.selectedOrganizationUserId = undefined;
        this.form.reset();
        if (this.forceClose) {
          this.dialogRef.close(this.trainingProgramId);
        }
      });
  }

  saveCandidate() {
    this.forceClose = false;
    this.saveCandidate$.next();
  }

  saveCandidateAndClose(isDraft: boolean) {
    this.forceClose = true;
    this.saveCandidate$.next(isDraft);
  }

  listenToAcceptTrainee() {
    this.acceptCandidate$
      .pipe(
        takeUntil(this.destroy$)
      )
      .pipe(exhaustMap(() => {
        return this.model.accept(this.trainingProgramId);
      }))
      .subscribe(() => {
        const message = this.lang.map.candidate_x_has_been_accepted.change({x: this.model.getName()});
        this.toast.success(message);
        this.dialogRef.close(this.model);
      });
  }

  rejectCandidate() {
    const sub = this.model.openRejectCandidateDialog(this.trainingProgramId, this.rejectionComment)
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

  mapUserToForm(user: OrgUser | InternalUser) {
    this.form.patchValue({
      id: this.operation == OperationTypes.CREATE ? null : user?.id,
      generalUserId: user?.generalUserId,
      arName: user?.arName,
      enName: user?.enName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      employementPosition: user?.jobTitleInfo?.enName,
      department: (user as InternalUser)?.defaultDepartmentInfo?.enName
    });
  }

  mapTraineeToForm(trainee: Trainee) {
    this.form.patchValue({
      id: this.operation == OperationTypes.CREATE ? null : trainee?.id,
      generalUserId: trainee?.generalUserId,
      arName: trainee?.arName,
      enName: trainee?.enName,
      jobType: trainee?.jobType,
      department: trainee?.department,
      trainingRecord: trainee?.trainingRecord,
      currentJob: trainee?.currentJob,
      employementPosition: trainee?.employementPosition,
      phoneNumber: trainee?.phoneNumber,
      email: trainee?.email,
      gender: trainee?.gender,
      nationality: trainee?.nationality
    });
  }

  showAuthorityTemplate() {
    return this.employeeType == 'authority' && this.operation == OperationTypes.CREATE;
  }

  showOrganizationsTemplate() {
    return this.employeeType == 'organization' && this.operation == OperationTypes.CREATE;
  }

  get popupTitle() {
    return this.operation == OperationTypes.CREATE ? this.lang.map.training_program_create_candidate : this.lang.map.training_program_review_candidate;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
