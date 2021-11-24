import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {of, Subject} from 'rxjs';
import {InternalUser} from '@app/models/internal-user';
import {OrgUser} from '@app/models/org-user';
import {Trainer} from '@app/models/trainer';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '@app/models/form-manager';
import {exhaustMap, takeUntil, tap} from 'rxjs/operators';
import {InternalUserService} from '@app/services/internal-user.service';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {OrgUnit} from '@app/models/org-unit';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {Trainee} from '@app/models/trainee';
import {TraineeService} from '@app/services/trainee.service';

@Component({
  selector: 'training-program-add-candidate-popup',
  templateUrl: './training-program-add-candidate-popup.component.html',
  styleUrls: ['./training-program-add-candidate-popup.component.scss']
})
export class TrainingProgramAddCandidatePopupComponent implements OnInit, OnDestroy {
  destroy$: Subject<void> = new Subject();
  employeeTypeChanged$: Subject<string> = new Subject<string>();
  loadAuthorityUsers$: Subject<void> = new Subject<void>();
  loadOrganizations$: Subject<void> = new Subject<void>();
  loadOrganizationUsers$: Subject<void> = new Subject<void>();
  selectAuthorityUser$: Subject<void> = new Subject<void>();
  selectOrganizationUser$: Subject<void> = new Subject<void>();
  saveCandidate$: Subject<void> = new Subject<void>();
  employeeType: string = '';
  authorityUsers: InternalUser[] = [];
  selectedAuthorityUser!: number;
  organizations: OrgUnit[] = [];
  organizationUsers: OrgUser[] = [];
  selectedOrganizationUser?: number;
  selectedOrganization!: number;
  trainer!: Trainer;
  form!: FormGroup;
  fm!: FormManager;
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  jobTypes: Lookup[] = this.lookupService.listByCategory.TRAINING_JOB_TYPE;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  @Input() trainingProgramId!: number;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private internalUserService: InternalUserService,
              private organizationUnitService: OrganizationUnitService,
              private organizationUserService: OrganizationUserService,
              private lookupService: LookupService,
              private traineeService: TraineeService) {
  }

  ngOnInit(): void {
    console.log('training program id = ', this.trainingProgramId);
    this.listenToEmployeeTypeChange();
    this.listenToLoadAuthorityUsers();
    this.listenToLoadOrganizations();
    this.listenToLoadOrganizationUsers();
    this.listenToSelectAuthorityUser();
    this.listenToSelectOrganizationUser();
    this.listenToSaveCandidate();
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      id: null,
      generalUserId: null,
      arName: [null, [CustomValidators.required]],
      enName: [null, [CustomValidators.required]],
      jobType: [null, [CustomValidators.required]],
      department: [null, [CustomValidators.required]],
      trainingRecord: [null, [CustomValidators.required]],
      currentJob: [null, [CustomValidators.required]],
      employementPosition: [null, [CustomValidators.required]],
      email: [null, [CustomValidators.required]],
      phoneNumber: [null, [CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]],
      gender: [null, [CustomValidators.required]],
      nationality: [null, [CustomValidators.required]]
    });
  }

  onEmployeeTypeChange() {
    this.form.reset();
    this.employeeTypeChanged$.next(this.employeeType);
    // console.log('emp type', this.employeeType);
  }

  listenToEmployeeTypeChange() {
    this.employeeTypeChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
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
        console.log('users', this.authorityUsers);
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
        console.log('organizations', this.organizations);
      });
  }

  onOrganizationChange() {
    this.form.reset();
    this.selectedOrganizationUser = undefined;
    this.loadOrganizationUsers$.next();
  }

  listenToLoadOrganizationUsers() {
    this.loadOrganizationUsers$
      .pipe(tap(() => {
        this.organizationUsers = [];
      }))
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        if (this.selectedOrganization != null) {
          return this.organizationUserService.getByCriteria({'org-id': this.selectedOrganization});
        } else {
          return of([]);
        }
      }))
      .subscribe((users) => {
        this.organizationUsers = users;
        console.log('users', this.organizationUsers);
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
      const user = this.authorityUsers.find(x => x.id == this.selectedAuthorityUser)!;
      this.mapUserToForm(user);
    });
  }

  listenToSelectOrganizationUser() {
    this.selectOrganizationUser$.subscribe(() => {
      this.form.reset();
      const user = this.organizationUsers.find(x => x.id == this.selectedOrganizationUser)!;
      this.mapUserToForm(user);
      console.log('selected org user', this.selectedOrganizationUser);
    });
  }

  listenToSaveCandidate() {
    this.saveCandidate$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        const trainee = (new Trainee()).clone({...this.form.value});
        return this.traineeService.enroll(this.trainingProgramId, trainee);
      }))
      .subscribe(() => {
        this.selectedOrganizationUser = undefined;
        this.form.reset();
      console.log('new user done');
    })
  }

  mapUserToForm(user: OrgUser | InternalUser) {
    this.form.patchValue({
      id: user.id,
      generalUserId: user.generalUserId,
      arName: user.arName,
      enName: user.enName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      employementPosition: user.jobTitleInfo?.enName,
      department: (user as InternalUser)?.defaultDepartmentInfo?.enName
    })
  }

  showAuthorityTemplate() {
    return this.employeeType == 'authority';
  }

  showOrganizationsTemplate() {
    return this.employeeType == 'organization';
  }

  get idControl(): FormControl {
    return this.form.get('id') as FormControl;
  }

  get generalUserIdControl(): FormControl {
    return this.form.get('generalUserId') as FormControl;
  }

  get arNameControl(): FormControl {
    return this.form.get('arName') as FormControl;
  }

  get enNameControl(): FormControl {
    return this.form.get('enName') as FormControl;
  }

  get jobTypeControl(): FormControl {
    return this.form.get('jobType') as FormControl;
  }

  get departmentControl(): FormControl {
    return this.form.get('department') as FormControl;
  }

  get trainingRecordControl(): FormControl {
    return this.form.get('trainingRecord') as FormControl;
  }

  get currentJobControl(): FormControl {
    return this.form.get('currentJob') as FormControl;
  }

  get employementPositionControl(): FormControl {
    return this.form.get('employementPosition') as FormControl;
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get genderControl(): FormControl {
    return this.form.get('gender') as FormControl;
  }

  get nationalityControl(): FormControl {
    return this.form.get('nationality') as FormControl;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
