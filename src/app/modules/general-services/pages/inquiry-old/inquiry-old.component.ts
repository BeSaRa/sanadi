import {Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LangService} from '@app/services/lang.service';
import {InternalDepartmentService} from '@app/services/internal-department.service';
import {InternalDepartment} from '@app/models/internal-department';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FormManager} from '@app/models/form-manager';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Inquiry} from '@app/models/inquiry';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';
import {SaveTypes} from '@app/enums/save-types';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {InquiryService} from '@app/services/inquiry.service';
import {IESComponent} from '@app/interfaces/iescomponent';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {CaseModel} from '@app/models/case-model';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@app/services/employee.service';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {NavigationService} from '@app/services/navigation.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {UserClickOn} from '@app/enums/user-click-on.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'inquiry-old',
  templateUrl: './inquiry-old.component.html',
  styleUrls: ['./inquiry-old.component.scss']
})
export class InquiryOldComponent implements OnInit, OnDestroy, IESComponent<Inquiry> {
  afterSave$: EventEmitter<Inquiry> = new EventEmitter<Inquiry>();
  fromWrapperComponent: boolean = false;
  onModelChange$: EventEmitter<Inquiry | undefined> = new EventEmitter<Inquiry | undefined>();
  accordionView: boolean = false;
  departments: InternalDepartment[] = [];
  destroy$: Subject<any> = new Subject<any>();
  fm!: FormManager;
  form!: UntypedFormGroup;
  categories: Lookup[] = this.lookupService.listByCategory.InquiryCategory;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  saveTypes: typeof SaveTypes = SaveTypes;
  operation: OperationTypes = OperationTypes.CREATE;
  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  model?: Inquiry;
  resetForm$: Subject<boolean> = new Subject<boolean>();
  private outModelChange$: BehaviorSubject<Inquiry> = new BehaviorSubject<Inquiry>(null as unknown as Inquiry);

  @Input()
  fromDialog: boolean = false;

  @Input()
  set outModel(model: Inquiry) {
    this.outModelChange$.next(model);
  }

  get outModel(): Inquiry {
    return this.outModelChange$.value;
  }

  private changeModel: BehaviorSubject<Inquiry | undefined> = new BehaviorSubject<Inquiry | undefined>(new Inquiry());
  private modelChange$: Observable<Inquiry | undefined> = this.changeModel.asObservable().pipe(tap(model => this.onModelChange$.emit(model)));

  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.form.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
    recommendations: {
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true
    }
  };

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  constructor(private http: HttpClient,
              public service: InquiryService,
              private intDepService: InternalDepartmentService,
              private fb: UntypedFormBuilder,
              private dialog: DialogService,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private toast: ToastService,
              private navigationService: NavigationService,
              public lang: LangService) {

  }

  ngOnInit(): void {
    this.service.ping();
    this.loadDepartments();
    this.buildForm();
    this._listenToResetForm();
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
    this.intDepService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  private buildForm() {
    const inquiry = new Inquiry();
    this.form = this.fb.group(inquiry.getFormFields(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  private listenToSave(): void {
    const validFormSubmit$ = this.save.pipe(
      filter(val => val === SaveTypes.FINAL || val === SaveTypes.COMMIT),
      tap(_ => (!this.form.valid ? this.displayInvalidFormMessage() : null)),
      filter(_ => this.form.valid),
    );

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

  private listenToDraftSave(draftSave$: Observable<any>): void {
    draftSave$.pipe(takeUntil(this.destroy$)).subscribe((fromValues) => {
      const model = (new Inquiry()).clone({...this.model, ...fromValues});
      model.draft()
        .pipe(takeUntil(this.destroy$), tap(_ => this.saveDraftMessage()))
        .subscribe((model) => {
          this.changeModel.next(model);
          this.afterSave$.emit(model);
        });
    });
  }

  private listenToFinalSave(finalSave$: Observable<any>): void {
    finalSave$.pipe(
      takeUntil(this.destroy$),
      exhaustMap((fromValues) => {
        const model = (new Inquiry()).clone({...this.model, ...fromValues});
        return model.save().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
      })
    ).subscribe((model) => {
      this.changeModel.next(model);
      this.afterSave$.emit(model);
    });
  }


  private listenToCommitSave(commitSave$: Observable<any>) {
    commitSave$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fromValues => {
      const model = (new Inquiry()).clone({...this.model, ...fromValues});
      model.commit().pipe(takeUntil(this.destroy$), tap(model => this.saveMessage(model)))
        .subscribe((model) => {
          this.changeModel.next(model);
          this.afterSave$.emit(model);
        });
    });
  }

  onCompetentDepChange(depId: number): void {
    const dep = this.departments.find(item => item.id === depId);
    dep ? this.setAuthName(dep) : this.setAuthName(null);
  }

  setAuthName(dep: InternalDepartment | null): void {
    this.fm.getFormField('competentDepartmentAuthName')?.setValue(dep ? dep.mainTeam.authName : null);
  }

  private displayInvalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled).onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.fm.displayFormValidity());
  }

  private listenToModelChange(): void {
    this.modelChange$
      .pipe(
        takeUntil(this.destroy$),
        tap((item) => this.model = item),
      )
      .subscribe((model) => {
        model?.id ? this.updateFromFields(model) : this.form.reset();
      });
  }

  private updateFromFields(model: Inquiry): void {
    this.form.patchValue(model.getFormFields());
  }

  private saveDraftMessage(): void {
    this.toast.success(this.lang.map.draft_was_saved_successfully);
  }

  private saveMessage(model: CaseModel<any, any>): void {
    if (this.operation === OperationTypes.CREATE) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
      this.operation = OperationTypes.UPDATE;
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  launch() {
    this.model?.start().subscribe(_ => {
      if (this.model) {
        this.model.caseStatus = CommonCaseStatus.UNDER_PROCESSING;
        this.resetForm$.next();
      }
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
      this.changeModel.next(this.model);
    });
  }

  private listenToOutModelChange() {
    this.outModelChange$
      .pipe(
        filter(model => !!model),
        takeUntil(this.destroy$)
      )
      .subscribe((model) => {
        this.changeModel.next(model);
      });
  }

  isAddCommentAllowed(): boolean {
    if (!this.model?.id || this.employeeService.isExternalUser()) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    return isAllowed;
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus();
        isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }
    return !isAllowed;
  }

  navigateBack(): void {
    this.navigationService.goToBack();
  }

  resetForm(): void {
    this.form.reset();
    this.model = new Inquiry();
    this.operation = OperationTypes.CREATE;
  }

  confirmResetForm(): DialogRef {
    return this.service.dialog.confirm(this.lang.map.msg_confirm_reset_form);
  }

  private _listenToResetForm(): void {
    this.resetForm$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((needConfirmation) => {
          if (needConfirmation){
            return this.confirmResetForm().onAfterClose$;
          } else {
            return of(UserClickOn.YES);
          }
        })
      )
      .subscribe((userClick: UserClickOn) => {
        if (userClick === UserClickOn.YES){
          this.operation = OperationTypes.CREATE;
          this.resetForm();
        }
      });
  }
}
