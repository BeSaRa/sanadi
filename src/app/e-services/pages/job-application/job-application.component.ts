import { ToastService } from "@app/services/toast.service";
import { DialogService } from "@app/services/dialog.service";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { JobApplicationCategories } from "./../../../enums/job-application-categories.enum";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { IEmployeeDto } from "@app/interfaces/i-employee-dto";
import { EmployeesDataComponent } from "../../shared/employees-data/employees-data.component";
import { LookupEmploymentCategory } from "./../../../enums/lookup-employment-category";
import { LookupService } from "./../../../services/lookup.service";
import { Lookup } from "./../../../models/lookup";
import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { CaseTypes } from "@app/enums/case-types.enum";
import { NavigationService } from "./../../../services/navigation.service";
import { LangService } from "./../../../services/lang.service";
import { JobApplicationService } from "./../../../services/job-application.service";
import { JobApplication } from "./../../../models/job-application";
import { Component, Input, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable, of } from "rxjs";
import { EmploymentRequestType } from "@app/enums/employment-request-type";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { SaveTypes } from "@app/enums/save-types";
import { filter, map, takeUntil, tap } from "rxjs/operators";
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

  employees: IEmployeeDto[] = [];
  fileIconsEnum = FileIconsEnum;
  caseType: number = CaseTypes.JOB_APPLICATION;

  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  @Input()
  fromDialog: boolean = false;

  private outModelChange$: BehaviorSubject<JobApplication> =
    new BehaviorSubject<JobApplication>(null as unknown as JobApplication);

  @Input()
  set outModel(model: JobApplication) {
    this.outModelChange$.next(model);
  }

  get outModel(): JobApplication {
    return this.outModelChange$.value;
  }
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;

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
  }
  _buildForm(): void {
    this.form = this.fb.group(new JobApplication().formBuilder(true));
  }
  _afterBuildForm(): void {
    this.handleCategoryChange();
    this.handleRequestTypeChange();
    this.handleDescriptionChange();
    this.setDefaultValues();
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
    console.log(saveType, operation, model);
    this.model = model;
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
    console.log("_saveFail", error);
  }
  _launchFail(error: any): void {
    console.log("_launchFail", error);
  }
  _destroyComponent(): void {
    console.log("_destroyComponent");
  }
  _updateForm(model: JobApplication | undefined): void {
    if (!model) {
      return;
    }
    console.log(model);
    this.model = model;
    this.form.patchValue(new JobApplication().formBuilder(true));
  }
  _resetForm(): void {
    this.form.reset();
    this.setDefaultValues();
  }

  private setDefaultValues(): void {
    this.requestType.patchValue(EmploymentRequestType.NEW);
    this.category.patchValue(JobApplicationCategories.NOTIFICATION);
  }
  openForm() {
    this.service.openAddNewEmployee(this.form, this.employees);
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
    return (
      this.requestType.value &&
      this.requestType.value === EmploymentRequestType.NEW
    );
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_employee_items_to_proceed);
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
