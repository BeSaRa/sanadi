import {UserClickOn} from '@enums/user-click-on.enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {AttachmentsComponent} from '@app/shared/components/attachments/attachments.component';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {EmploymentSearchCriteria} from '@models/employment-search-criteria';
import {JobTitleService} from '@services/job-title.service';
import {DateUtils} from '@helpers/date-utils';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {OperationTypes} from '@enums/operation-types.enum';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CaseTypes} from '@enums/case-types.enum';
import {Component, Input, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {EmploymentRequestType} from '@enums/service-request-types';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {SaveTypes} from '@enums/save-types';
import {Employee} from '@models/employee';
import {JobTitle} from '@models/job-title';
import {Lookup} from '@models/lookup';
import {NavigationService} from '@services/navigation.service';
import {LookupService} from '@services/lookup.service';
import {LangService} from '@services/lang.service';
import {EmploymentCategory} from '@enums/employment-category.enum';
import {AdminResult} from '@models/admin-result';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Employment} from '@models/employment';
import {EmploymentService} from '@services/employment.service';
import {EmployeesDataComponent} from '@modules/services/employment/shared/employees-data/employees-data.component';
import {FieldControlAndLabelKey} from '@app/types/types';

@Component({
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.scss'],
})
export class EmploymentComponent extends EServicesGenericComponent<Employment, EmploymentService> {
  form!: UntypedFormGroup;
  identificationNumberSearch$: Subject<Partial<EmploymentSearchCriteria>> = new Subject<Partial<EmploymentSearchCriteria>>();

  employees: Partial<Employee>[] = [];
  fileIconsEnum = FileIconsEnum;
  caseType: number = CaseTypes.EMPLOYMENT;

  @ViewChild(AttachmentsComponent)
  attachmentComponent!: AttachmentsComponent;

  @ViewChild('ETable') ETable!: EmployeesDataComponent;
  @Input()
  fromDialog: boolean = false;
  externalJobTitleList: JobTitle[] = [];
  systemJobTitleList: JobTitle[] = [];
  readonly: boolean = false;
  allowEditRecommendations: boolean = true;
  searchCriteriaForm: UntypedFormGroup = new UntypedFormGroup({
    identificationNumber: new UntypedFormControl(''),
    passportNumber: new UntypedFormControl(''),
  });
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
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    employeeInfo: {
      name: 'employeeInfoTab',
      langKey: 'employee_data',
      validStatus: () => this.employees.length,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestTypeField', 'requestType');
    },
    category: () => {
      return this.getObservableField('category', 'category');
    }
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
    this.listenToSearchCriteria();
    this.jobTitleService.getSystemJobTitle().subscribe((data: JobTitle[]) => {
      this.systemJobTitleList = [...data];
    });
    this.jobTitleService.getExternalJobTitle().subscribe((data: JobTitle[]) => {
      this.externalJobTitleList = [...data];
    });
  }

  _buildForm(): void {
    this.form = this.fb.group(new Employment().formBuilder(true));
  }

  _afterBuildForm(): void {
    this.handleCategoryChange();
    this.handleDescriptionChange();
    if (this.operation == OperationTypes.CREATE) {
      this.setDefaultValues();
    }
  }

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      {control: this.requestTypeField, labelKey: 'request_type'},
      {control: this.category, labelKey: 'order_type'},
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialog.error(this.lang.map.msg_please_validate_x_to_continue.change({x: this.lang.map[invalidDraftField.labelKey]}));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    if (this.isNewRequestType()) {
      return true;
    } else {
      if (!this._hasEmployeeItems()) {
        this.invalidItemMessage();
        return false;
      }
    }
    return true;
  }

  private _hasEmployeeItems(): boolean {
    return !!(this.model && this.model.employeeInfoDTOs.length);
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestTypeField.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.request_type}));
      return false;
    }
    if (!this.category.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.order_type}));
      return false;
    }
    if (saveType === SaveTypes.DRAFT) {
      return this._isValidDraftData();
    }
    const validAttachments$ = this.attachmentComponent.attachments.length ? of(true) : this.attachmentComponent.reload();

    return (this.model?.id ? validAttachments$ : of(this.form.valid)
      .pipe(tap((valid) => !valid && this.invalidFormMessage()))
      .pipe(filter((valid) => valid))
      .pipe(map((_) => this._hasEmployeeItems()))
      .pipe(tap(
        (hasEmployeeItems) => !hasEmployeeItems && this.invalidItemMessage()
      ))
      .pipe(filter((valid) => valid))
      .pipe(
        switchMap(() => {
          if (this.isNewRequestType()) {
            return this.service.bulkValidate(this.employees);
          }
          return of({});
        }),
        tap(
          (data) => {
            this.dublicateIdintifierMessage(data);
          }
        ),
        map(_map => {
          delete _map.size;
          return Object.keys(_map).reduce((prv, cur) => {
            return prv + Object.keys(_map[cur]).filter((k: string) => _map[cur][k]).length;
          }, 0) == 0;
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
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): Employment | Observable<Employment> {
    return new Employment().clone({
      ...this.model,
      requestType: this.form.value.requestType,
      category: this.form.value.category
    });
  }

  private _updateModelAfterSave(model: Employment): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
    this.employees = [...model.employeeInfoDTOs];
  }

  _afterSave(
    model: Employment,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this._updateModelAfterSave(model);
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
      };
    })];
    this.model && (this.model.employeeInfoDTOs = this.employees);
  }

  _launchFail(error: any): void {
    console.log('_launchFail', error);
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
    this.handleRequestTypeChange(model.requestType, false);
  }

  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
  }

  private setDefaultValues(): void {
    this.requestTypeField.patchValue(EmploymentRequestType.NEW);
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
        this.requestTypeField.setValue(EmploymentRequestType.NEW);
        this.handleRequestTypeChange(EmploymentRequestType.NEW, false);
        this.model!.employeeInfoDTOs = [];
        this.employees = [];
      });
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false) {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          let cat = this.category.value;

          this.resetForm$.next();
          this.category.setValue(cat);
          this.requestTypeField.setValue(requestTypeValue);
          this.model!.employeeInfoDTOs = [];
          this.employees = [];
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
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
    return this.requestTypeField.value === EmploymentRequestType.NEW;
  }

  isCreateOperation() {
    return this.operation === OperationTypes.CREATE;
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
          .pipe(catchError(() => of([])));
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
            expIdPass: DateUtils.changeDateToDatepicker(res[0].expIdPass),
            jobTitleInfo: AdminResult.createInstance({
              id: res[0].jobTitleInfo.id,
              arName: res[0].jobTitleInfo.arName,
              enName: res[0].jobTitleInfo.enName,
            }),
            contractExpiryDate: DateUtils.changeDateToDatepicker(
              res[0].contractExpiryDate
            ),
            identificationNumber: res[0].qId
          }];
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
      });
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
    return this.category.value == EmploymentCategory.APPROVAL;
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
    data.qID && Object.keys(data.qID).filter(k => data.qID[k]).forEach((k) => {
      message += this.lang.map.employee_with_identification + ' ' + k + ' ' + this.lang.map.is_exist_before + '\n';
    })
    data.passportNumber && Object.keys(data.passportNumber).filter(k => data.passportNumber[k]).forEach((k) => {
      message += this.lang.map.passport_number + ' ' + k + ' ' + this.lang.map.is_exist_before + '\n';
    })
    data.jobNumber && Object.keys(data.jobNumber).filter(k => data.jobNumber[k]).forEach((k) => {
      message += this.lang.map.employee_with_jobNumber + ' ' + k + ' ' + this.lang.map.is_exist_before + '\n';
    })
    if (message) {
      this.dialog.error(message);
    }
  }

  get identificationNumber(): UntypedFormControl {
    return this.searchCriteriaForm.get('identificationNumber') as UntypedFormControl;
  }

  get passportNumber(): UntypedFormControl {
    return this.searchCriteriaForm.get('passportNumber') as UntypedFormControl;
  }

  get requestTypeField(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
  }

  get category(): UntypedFormControl {
    return this.form.get('category') as UntypedFormControl;
  }

  get description(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }

  navigateBack(): void {
    this.navigationService.goToBack();
  }
}
