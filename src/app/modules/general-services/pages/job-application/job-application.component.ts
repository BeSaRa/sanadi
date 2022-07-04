import { JobTitleService } from '@app/services/job-title.service';
import { DateUtils } from '@app/helpers/date-utils';
import { ToastService } from "@app/services/toast.service";
import { DialogService } from "@app/services/dialog.service";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { CaseTypes } from "@app/enums/case-types.enum";
import { Component, Input, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, of, Subject } from "rxjs";
import { EmploymentRequestType } from "@app/enums/employment-request-type";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { SaveTypes } from "@app/enums/save-types";
import { catchError, exhaustMap, filter, map, takeUntil, tap } from "rxjs/operators";
import { JobApplication } from '@app/models/job-application';
import { JobApplicationService } from '@app/services/job-application.service';
import { Employee } from '@app/models/employee';
import { JobApplicationSearchCriteria } from '@app/models/job-application-search-criteria';
import { JobTitle } from '@app/models/job-title';
import { Lookup } from '@app/models/lookup';
import { NavigationService } from '@app/services/navigation.service';
import { LookupService } from '@app/services/lookup.service';
import { LangService } from '@app/services/lang.service';
import { JobApplicationCategories } from '@app/enums/job-application-categories.enum';
import { LookupEmploymentCategory } from '@app/enums/lookup-employment-category';
import { AdminResult } from '@app/models/admin-result';
import { EmployeesDataComponent } from '@app/modules/e-services-main/shared/employees-data/employees-data.component';
@Component({
  selector: "app-job-application",
  templateUrl: "./job-application.component.html",
  styleUrls: ["./job-application.component.scss"],
})
export class JobApplicationComponent extends EServicesGenericComponent<
JobApplication,
JobApplicationService
> {
  form!: FormGroup;
  identificationNumberSearch$: Subject<Partial<JobApplicationSearchCriteria>> = new Subject<Partial<JobApplicationSearchCriteria>>();

  employees: Partial<Employee>[] = [];
  fileIconsEnum = FileIconsEnum;
  caseType: number = CaseTypes.JOB_APPLICATION;

  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  @Input()
  fromDialog: boolean = false;
  externalJobTitleList: JobTitle[] = [];
  systemJobTitleList: JobTitle[] = [];
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;
  searchCriteriaForm: FormGroup = new FormGroup({
    identificationNumber: new FormControl(''),
    passportNumber: new FormControl(''),
  })
  EmploymentCategory: Lookup[] =
    this.lookupService.listByCategory.EmploymentCategory.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  EmploymentRequestType: Lookup[] =
    this.lookupService.listByCategory.EmploymentRequestType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  filterdRequestTypeList: Lookup[] =
    this.lookupService.listByCategory.EmploymentRequestType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    employeeInfo: {
      name: "employeeInfoTab",
      langKey: "employee_data",
      validStatus: () => this.employees.length,
    },
  };
  constructor(
    public service: JobApplicationService,
    private navigationService: NavigationService,
    private dialog: DialogService,
    public fb: FormBuilder,
    private jobTitleService: JobTitleService,
    private lookupService: LookupService,
    public lang: LangService,
    private toast: ToastService
  ) {
    super();
  }

  _getNewInstance(): JobApplication {
    return new JobApplication();
  }
  _initComponent(): void {
    this._buildForm();
    this.service.onSubmit.subscribe((data) => {
      this.employees = [...data];
      this.model && (this.model.employeeInfoDTOs = this.employees);
    });
    this.listenToSearchCriteria()
    this.jobTitleService.getSystemJobTitle().subscribe((data: JobTitle[]) => {
      this.systemJobTitleList = [...data]
    })
    this.jobTitleService.getExternalJobTitle().subscribe((data: JobTitle[]) => {
      this.externalJobTitleList = [...data]
    })
  }
  _buildForm(): void {
    this.form = this.fb.group(new JobApplication().formBuilder(true));
  }
  _afterBuildForm(): void {
    this.handleCategoryChange();
    this.handleRequestTypeChange();
    this.handleDescriptionChange();
    if (this.operation == OperationTypes.CREATE) this.setDefaultValues();
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap((valid) => !valid && this.invalidFormMessage()))
      .pipe(filter((valid) => valid))
      .pipe(map((_) => !!(this.model && this.model.employeeInfoDTOs.length)))
      .pipe(
        tap(
          (hasEmployeeItems) => !hasEmployeeItems && this.invalidItemMessage()
        )
      );
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.employeeInfoDTOs.length) {
      this.invalidItemMessage();
    }
    return true;
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): JobApplication | Observable<JobApplication> {
    return new JobApplication().clone({
      ...this.model,
    });
  }
  _afterSave(
    model: JobApplication,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.model = model;
    this.employees = [...model.employeeInfoDTOs];
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }
  _saveFail(error: any): void {
    this.employees = [...this.employees.map(e => {
      return {
        ...e,
        workStartDate: DateUtils.changeDateToDatepicker(e.workStartDate),
        workEndDate: DateUtils.changeDateToDatepicker(e.workEndDate),
        updatedOn: DateUtils.changeDateToDatepicker(e.updatedOn),
        jobTitleInfo: [...this.systemJobTitleList, ...this.externalJobTitleList].find(jt => jt.id == e.jobTitleId),
        contractExpiryDate: DateUtils.changeDateToDatepicker(
          e.contractExpiryDate
        )
      }
    })]
    this.model && (this.model.employeeInfoDTOs = this.employees)
  }
  _launchFail(error: any): void {
    console.log("_launchFail", error);
  }
  _destroyComponent(): void {
    this.identificationNumberSearch$.unsubscribe();
  }
  _updateForm(model: JobApplication | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.employees = [...model.employeeInfoDTOs];
    this.form = this.fb.group(model.formBuilder(true));
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
  }
  private setDefaultValues(): void {
    this.requestType.patchValue(EmploymentRequestType.NEW);
    this.category.patchValue(JobApplicationCategories.NOTIFICATION);
  }
  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }
  openForm() {
    this.service.openAddNewEmployee(this.form, this.employees, this.model, this.operation,
      this.category.value == LookupEmploymentCategory.APPROVAL ? this.systemJobTitleList : this.externalJobTitleList
    );
  }
  handleCategoryChange(): void {
    this.category.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: JobApplicationCategories) => {
        this.model!.category = val;
        this.requestType.setValue(null);
        this.model!.requestType = EmploymentRequestType.NEW;
        this.model!.employeeInfoDTOs = [];
        this.employees = [];
      });
  }
  handleRequestTypeChange() {
    this.requestType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: EmploymentRequestType) => {
        this.model!.requestType = val;
        this.model!.employeeInfoDTOs = [];
        this.employees = [];
      });
  }
  handleDescriptionChange() {
    this.description.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        this.model!.description = val;
      });
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  getRequestTypeList() {
    return this.EmploymentRequestType.filter(
      (eqt) =>
        !(
          eqt.lookupKey == EmploymentRequestType.CANCEL &&
          this.category.value == LookupEmploymentCategory.NOTIFICATION
        )
    );
  }
  isNewRequestType(): boolean {
    return this.requestType.value === EmploymentRequestType.NEW
  }
  isCreateOperation() {
    return this.operation === OperationTypes.CREATE
  }
  loadSearchByCriteria(criteria: Partial<JobApplicationSearchCriteria>): Observable<Employee[]> {
    return this.service.findEmployee(criteria);
  }
  private listenToSearchCriteria() {
    this.identificationNumberSearch$
      .pipe(exhaustMap(dto => {
        return this.loadSearchByCriteria({
          identificationNumber: dto.identificationNumber,
          passportNumber: dto.passportNumber,
          isManager: this.category.value == LookupEmploymentCategory.APPROVAL,
        })
          .pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        map((res: any) => {
          return [{
            ...res[0],
            workStartDate: DateUtils.changeDateToDatepicker(res[0].workStartDate),
            workEndDate: DateUtils.changeDateToDatepicker(res[0].workEndDate),
            updatedOn: DateUtils.changeDateToDatepicker(res[0].updatedOn),
            jobTitleInfo: AdminResult.createInstance({
              id: res[0].jobTitleInfo.id,
              arName: res[0].jobTitleInfo.arName,
              enName: res[0].jobTitleInfo.enName,
            }),
            contractExpiryDate: DateUtils.changeDateToDatepicker(
              res[0].contractExpiryDate
            ),
            identificationNumber: res[0].qId
          }]
        }),
        // switch to the dialog ref to use it later and catch the user response
        takeUntil(this.destroy$)
      )
      .subscribe((e: Employee[]) => {
        if (this.isApprova()) {
          this.employees = [...e];
        } else {
          this.employees = [...e, ...this.employees];
        }
        this.model && (this.model.employeeInfoDTOs = this.employees);
      })
  }
  CriteriaSearch(): void {
    const identificationNumber = this.identificationNumber.value && this.identificationNumber.value.trim();
    const passportNumber = this.passportNumber.value && this.passportNumber.value.trim();
    this.identificationNumberSearch$.next({
      identificationNumber: identificationNumber,
      passportNumber: passportNumber,
    });
  }
  isApprova() {
    return this.category.value == LookupEmploymentCategory.APPROVAL
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_employee_items_to_proceed);
  }
  get identificationNumber(): FormControl {
    return this.searchCriteriaForm.get("identificationNumber") as FormControl;
  }
  get passportNumber(): FormControl {
    return this.searchCriteriaForm.get("passportNumber") as FormControl;
  }
  get requestType(): FormControl {
    return this.form.get("requestType") as FormControl;
  }
  get category(): FormControl {
    return this.form.get("category") as FormControl;
  }
  get description(): FormControl {
    return this.form.get("description") as FormControl;
  }
  navigateBack(): void {
    this.navigationService.goToBack();
  }
}
