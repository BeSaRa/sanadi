import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IESComponent} from '../../../../interfaces/iescomponent';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SaveTypes} from '../../../../enums/save-types';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Consultation} from '../../../../models/consultation';
import {FormManager} from '../../../../models/form-manager';
import {Lookup} from '../../../../models/lookup';
import {LookupService} from '../../../../services/lookup.service';
import {HttpClient} from '@angular/common/http';
import {DialogService} from '../../../../services/dialog.service';
import {ToastService} from '../../../../services/toast.service';
import {LangService} from '../../../../services/lang.service';
import {ConsultationService} from '../../../../services/consultation.service';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {OrgUnit} from '../../../../models/org-unit';
import {OrganizationUnitService} from '../../../../services/organization-unit.service';
import {CaseStatus} from '../../../../enums/case-status.enum';
import {InternalDepartment} from '../../../../models/internal-department';
import {InternalDepartmentService} from '../../../../services/internal-department.service';
import {EmployeeService} from '../../../../services/employee.service';
import {CustomValidators} from '../../../../validators/custom-validators';

@Component({
  selector: 'consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit, OnDestroy, IESComponent {
  departments: InternalDepartment[] = [];
  organizations: OrgUnit[] = [];
  destroy$: Subject<any> = new Subject<any>();
  saveTypes: typeof SaveTypes = SaveTypes;
  form!: FormGroup;
  fm!: FormManager;
  categories: Lookup[] = this.lookupService.listByCategory.ConsultationCategory;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  model?: Consultation;
  editMode: boolean = false;
  public isInternalUser: boolean = this.employeeService.isInternalUser();
  private outModelChange$: BehaviorSubject<Consultation> = new BehaviorSubject<Consultation>(null as unknown as Consultation);

  private changeModel: BehaviorSubject<Consultation | undefined> = new BehaviorSubject<Consultation | undefined>(new Consultation());
  private modelChange$: Observable<Consultation | undefined> = this.changeModel.asObservable();

  @Input()
  fromDialog: boolean = false;

  @Input()
  set outModel(model: Consultation) {
    this.outModelChange$.next(model);
  }

  get outModel(): Consultation {
    return this.outModelChange$.value;
  }

  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  constructor(private http: HttpClient,
              public service: ConsultationService,
              private fb: FormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              private toast: ToastService,
              public employeeService: EmployeeService,
              private intDepService: InternalDepartmentService,
              public lang: LangService,
              private orgUnitService: OrganizationUnitService) {
  }

  ngOnInit(): void {
    this.service.ping();
    this.loadOrganizations();
    if (this.isInternalUser) {
      this.loadDepartments();
    }
    this.buildForm();
    this.listenToSave();
    this.listenToModelChange();
    this.listenToOutModelChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private loadDepartments(): void {
    this.intDepService.loadDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private loadOrganizations(): void {
    this.orgUnitService.load().pipe(takeUntil(this.destroy$))
      .subscribe(organizations => this.organizations = organizations);
  }

  private buildForm(): void {
    const consultation = new Consultation();
    this.form = this.fb.group(consultation.getFormFields(true));
    this.fm = new FormManager(this.form, this.lang);

    if (this.isInternalUser) {
      this.form.get('competentDepartmentID')?.setValidators(CustomValidators.required);
      this.form.get('competentDepartmentID')?.updateValueAndValidity();
    }
  }

  private listenToSave() {
    const validFormSubmit$ = this.save.pipe(
      filter(val => val === SaveTypes.FINAL || val === SaveTypes.COMMIT),
      tap(_ => !this.form.valid ? this.displayInvalidFormMessage() : null),
      filter(_ => this.form.valid));

    const finalSave$ = validFormSubmit$
      .pipe(filter(val => val === SaveTypes.FINAL), map(_ => this.form.value));
    const commitSave$ = validFormSubmit$
      .pipe(filter(val => val === SaveTypes.COMMIT), map(_ => this.form.value));

    const draftSave$ = this.save
      .pipe(filter(val => val === SaveTypes.DRAFT), map(_ => this.form.value));

    this.listenToDraftSave(draftSave$);
    this.listenToFinalSave(finalSave$);
    this.listenToCommitSave(commitSave$);
  }

  launch() {
    this.model?.start().subscribe(_ => {
      if (this.model) {
        this.model.caseStatus = CaseStatus.STARTED;
        this.form.reset();
        this.model = undefined;
      }
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
    });
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.fm.displayFormValidity());
  }

  private listenToDraftSave(draftSave$: Observable<any>): void {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((fromValues) => {
      const model = (new Consultation()).clone({...this.model, ...fromValues});
      model.draft()
        .pipe(takeUntil(this.destroy$), tap(_ => this.saveDraftMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private listenToFinalSave(finalSave$: Observable<any>): void {
    finalSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((fromValues) => {
      const model = (new Consultation()).clone({...this.model, ...fromValues});
      model.save().pipe(takeUntil(this.destroy$), tap(_ => this.saveMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private listenToCommitSave(commitSave$: Observable<any>): void {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((fromValues) => {
      const model = (new Consultation()).clone({...this.model, ...fromValues});
      model.save().pipe(takeUntil(this.destroy$), tap(_ => this.saveMessage()))
        .subscribe((model) => this.changeModel.next(model));
    });
  }

  private saveDraftMessage(): void {
    this.toast.success(this.lang.map.draft_was_saved_successfully);
  }

  private saveMessage(): void {
    this.toast.success(this.lang.map.request_has_been_saved_successfully);
  }

  private listenToModelChange(): void {
    this.modelChange$.pipe(
      takeUntil(this.destroy$),
      tap(item => this.model = item)
    ).subscribe((model) => {
      model ? this.updateFromFields(model) : this.form.reset();
    });
  }

  private updateFromFields(model: Consultation): void {
    this.form.patchValue(model.getFormFields());
  }

  private listenToOutModelChange(): void {
    this.outModelChange$
      .pipe(
        filter(model => !!model),
        takeUntil(this.destroy$)
      )
      .subscribe((model) => {
        this.changeModel.next(model);
      });
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.fm.getFormField('competentDepartmentAuthName')?.setValue(dep ? dep.mainTeam.authName : null);
  }
}
