import { TabComponent } from './../../../../shared/components/tab/tab.component';
import { AttachmentsComponent } from '@app/shared/components/attachments/attachments.component';
import { CommonCaseStatus } from './../../../../enums/common-case-status.enum';
import { OpenFrom } from './../../../../enums/open-from.enum';
import { EmploymentSearchCriteria } from '@app/models/employment-search-criteria';
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
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Observable, of, Subject } from "rxjs";
import { EmploymentRequestType } from "@app/enums/employment-request-type";
import { FileIconsEnum } from "@app/enums/file-extension-mime-types-icons.enum";
import { SaveTypes } from "@app/enums/save-types";
import { Employee } from '@app/models/employee';
import { JobTitle } from '@app/models/job-title';
import { Lookup } from '@app/models/lookup';
import { NavigationService } from '@app/services/navigation.service';
import { LookupService } from '@app/services/lookup.service';
import { LangService } from '@app/services/lang.service';
import { EmploymentCategory } from '@app/enums/employment-category.enum';
import { AdminResult } from '@app/models/admin-result';
import { EmployeesDataComponent } from '@app/modules/e-services-main/shared/employees-data/employees-data.component';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { Employment } from '@app/models/employment';
import { EmploymentService } from '@app/services/employment.service';

@Component({
  templateUrl: "./employment.component.html",
  styleUrls: ["./employment.component.scss"],
})
export class EmploymentComponent extends EServicesGenericComponent<
Employment,
EmploymentService
> {
  form!: UntypedFormGroup;
  identificationNumberSearch$: Subject<Partial<EmploymentSearchCriteria>> = new Subject<Partial<EmploymentSearchCriteria>>();

  employees: Partial<Employee>[] = [];
  fileIconsEnum = FileIconsEnum;
  caseType: number = CaseTypes.EMPLOYMENT;

  @ViewChild(AttachmentsComponent)
  attachmentComponent!: AttachmentsComponent;

  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  @Input()
  fromDialog: boolean = false;
  externalJobTitleList: JobTitle[] = [];
  systemJobTitleList: JobTitle[] = [];
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;
  searchCriteriaForm: UntypedFormGroup = new UntypedFormGroup({
    identificationNumber: new UntypedFormControl(''),
    passportNumber: new UntypedFormControl(''),
  })
  loadAttachments: boolean = false;

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
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  constructor(
    public service: EmploymentService,
    private navigationService: NavigationService,
    private dialog: DialogService,
    public fb: UntypedFormBuilder,
    private jobTitleService: JobTitleService,
    private lookupService: LookupService,
    public lang: LangService,
    private toast: ToastService
  ) {
    super();
  }

  _getNewInstance(): Employment {
    return new Employment();
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
    this.form = this.fb.group(new Employment().formBuilder(true));
  }
  _afterBuildForm(): void {
    this.handleCategoryChange();
    this.handleRequestTypeChange();
    this.handleDescriptionChange();
    if (this.operation == OperationTypes.CREATE) this.setDefaultValues();
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    const validAttachments$ = this.attachmentComponent.attachments.length ? of(true) : this.attachmentComponent.reload();

    return (this.model?.id ? validAttachments$ : of(this.form.valid)
    .pipe(tap((valid) => !valid && this.invalidFormMessage()))
    .pipe(filter((valid) => valid))
    .pipe(map((_) => !!(this.model && this.model.employeeInfoDTOs.length)))
    .pipe(tap(
      (hasEmployeeItems) => !hasEmployeeItems && this.invalidItemMessage()
    ))
    .pipe(filter((valid) => valid))
    .pipe(
      switchMap(() => {
        if (this.isNewRequestType())
          return this.service.bulkValidate(this.employees)
        return of({})
      }),
      tap(
        (data) => {
          this.dublicateIdintifierMessage(data)
        }
      ),
      map(_map => {
        delete _map.size
        return Object.keys(_map).filter(k => _map[k]).length == 0
      }),
    ));
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
  _prepareModel(): Employment | Observable<Employment> {
    return new Employment().clone({
      ...this.model,
    });
  }
  _afterSave(
    model: Employment,
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

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
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
  _updateForm(model: Employment | undefined): void {
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
    this.category.patchValue(EmploymentCategory.NOTIFICATION);
  }
  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }
  openForm() {
    this.service.openAddNewEmployee(this.form, this.employees, this.model, this.operation,
      this.category.value == EmploymentCategory.APPROVAL ? this.systemJobTitleList : this.externalJobTitleList
    );
  }
  handleCategoryChange(): void {
    this.category.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: EmploymentCategory) => {
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
          this.category.value == EmploymentCategory.NOTIFICATION
        )
    );
  }

  isNewRequestType(): boolean {
    return this.requestType.value === EmploymentRequestType.NEW
  }
  isCreateOperation() {
    return this.operation === OperationTypes.CREATE
  }
  loadSearchByCriteria(criteria: Partial<EmploymentSearchCriteria>): Observable<Employee[]> {
    return this.service.findEmployee(criteria);
  }
  private listenToSearchCriteria() {
    this.identificationNumberSearch$
      .pipe(exhaustMap(dto => {
        return this.loadSearchByCriteria({
          identificationNumber: dto.identificationNumber,
          passportNumber: dto.passportNumber,
          isManager: this.category.value == EmploymentCategory.APPROVAL,
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
        if (this.isApproval()) {
          this.employees = [...e];
        } else {
          if (this.employees.findIndex(emp => e[0].identificationNumber == emp.identificationNumber) == -1) {
            this.employees = [...e, ...this.employees];
          }
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
  isApproval() {
    return this.category.value == EmploymentCategory.APPROVAL
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_employee_items_to_proceed);
  }
  dublicateIdintifierMessage(data: any) {
    delete data.size;
    let message = '';
    Object.keys(data).filter(k => data[k]).forEach((k) => {
      message += this.lang.map.employee_with_identification + ' ' + k + ' ' + this.lang.map.is_exist_before + '\n';
    })
    if (message)
      this.dialog.error(message);
  }
  get identificationNumber(): UntypedFormControl {
    return this.searchCriteriaForm.get("identificationNumber") as UntypedFormControl;
  }
  get passportNumber(): UntypedFormControl {
    return this.searchCriteriaForm.get("passportNumber") as UntypedFormControl;
  }
  get requestType(): UntypedFormControl {
    return this.form.get("requestType") as UntypedFormControl;
  }
  get category(): UntypedFormControl {
    return this.form.get("category") as UntypedFormControl;
  }
  get description(): UntypedFormControl {
    return this.form.get("description") as UntypedFormControl;
  }
  navigateBack(): void {
    this.navigationService.goToBack();
  }
}
