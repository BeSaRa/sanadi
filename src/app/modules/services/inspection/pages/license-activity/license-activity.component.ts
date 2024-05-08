import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseTypes } from '@app/enums/case-types.enum';
import { LinkedProjectTypes } from '@app/enums/linked-project-type.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';
import { FBuilder } from '@app/helpers/FBuilder';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IFormRowGroup } from '@app/interfaces/iform-row-group';
import { IServiceConstructor } from '@app/interfaces/iservice-constructor';
import { GeneralInterceptor } from '@app/model-interceptors/general-interceptor';
import { GeneralSearchCriteriaInterceptor } from '@app/model-interceptors/general-search-criteria-interceptor';
import { InspectionLog } from '@app/models/inspection-log';
import { LicenseApproval } from '@app/models/license-approval';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { LicenseActivityService } from '@app/services/license-activity.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, skip, startWith, take, takeUntil, tap } from 'rxjs/operators';
import { InspectionLogsPopupComponent } from '../../popups/inspection-logs-popup/inspection-logs-popup.component';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { PageEvent } from '@app/interfaces/page-event';
import { CaseModel } from '@app/models/case-model';
import { Pagination } from '@app/models/pagination';
import { ActualInspectionService } from '@app/services/actual-inspection.service';
import { ActualInspectionCreationSource } from '@app/enums/actual-inspection-creation-source.enum';
import { ActualInspection } from '@app/models/actual-inspection';

@Component({
  selector: 'license-activity',
  templateUrl: 'license-activity.component.html',
  styleUrls: ['license-activity.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class LicenseActivityComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private selectedService!: BaseGenericEService<any>;

  searchColumns: string[] = ['fullSerial', 'licenseType', 'hasInspected', 'inspectionStatus', 'lastInspectionDate', 'inspectorId', 'actions'];
  headerColumn: string[] = ['extra-header'];
  form!: UntypedFormGroup;
  fields: FormlyFieldConfig[] = [];
  results: LicenseApprovalModel<any, any>[] = [];
  actions: IMenuItem<LicenseApprovalModel<any, any>>[] = [];
  search$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  tabIndex$: Subject<number> = new Subject<number>();
  defaultDates: string = '';
  fieldsNames: string[] = [];
  filter: string = '';
  searchState: any;
  oldValuesAssigned: boolean = false;
  licenseTypes = this.lookupService.listByCategory.LicenseType;
  linkedProjects = this.lookupService.listByCategory.LinkedProject;
  getLicenseType(licenseType: number) {
    return this.licenseTypes.find(x => x.lookupKey == licenseType)?.getName() ?? ''
  }
  hasInspected(inspectionStatus?: number) {
    return !!inspectionStatus ? this.linkedProjects.find(item => item.lookupKey === LinkedProjectTypes.YES)?.getName() :
      this.linkedProjects.find(item => item.lookupKey === LinkedProjectTypes.NO)?.getName()
      ?? ''
  }
  servicesWithoutLicense = [
    CaseTypes.INQUIRY,
    CaseTypes.CONSULTATION,
    CaseTypes.INTERNATIONAL_COOPERATION,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.INTERNAL_PROJECT_LICENSE,
    CaseTypes.EXTERNAL_PROJECT_MODELS,
    CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE,
    CaseTypes.URGENT_INTERVENTION_CLOSURE,
    CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION,
    CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE,
    CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP,
    CaseTypes.NPO_MANAGEMENT,
    CaseTypes.GENERAL_PROCESS_NOTIFICATION,
    CaseTypes.CHARITY_ORGANIZATION_UPDATE,
    CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT

  ]

  serviceNumbers: number[] = Array.from(this.inboxService.services.keys()).filter(caseType => this.hasSearchPermission(caseType));
  serviceControl: UntypedFormControl = new UntypedFormControl(this.serviceNumbers[0]);

  get criteriaTitle(): string {
    return this.lang.map.search_result + (this.results.length ? ' (' + this.results.length + ')' : '');
  };


  constructor(public lang: LangService,
    private activatedRoute: ActivatedRoute,
    private inboxService: InboxService,
    private licenseService: LicenseService,
    private dialog: DialogService,
    private http: HttpClient,
    private employeeService: EmployeeService,
    private toast: ToastService,
    private lookupService: LookupService,
    private licenseActivityService: LicenseActivityService,
    private actualInspectionService: ActualInspectionService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.buildGridActions();
  }

  ngOnInit(): void {
    this.form = new UntypedFormGroup({});
    this.reSelectService();
    this._loadSearchFields();
    this.listenToServiceChange(this.serviceControl.value);
    this.listenToSearch();
    this.buildGridActions();
  }

  private hasSearchPermission(caseType: number): boolean {
    if (this.employeeService.isInternalUser()) {
      return !this.servicesWithoutLicense.includes(caseType)
    }
    return !this.servicesWithoutLicense.includes(caseType) && this.employeeService.userCanManage(caseType);
  }

  private search(value: Partial<LicenseApprovalModel<any, any>>) {
    const caseType = (this.selectedService.getSearchCriteriaModel()).caseType;
    let criteria = this.selectedService.getSearchCriteriaModel().clone(value).filterSearchFields(this.fieldsNames);
    criteria.caseType = caseType;
    criteria.pageSize = value.pageSize;
    criteria.pageNumber = value.pageNumber;
    this.searchState = this.normalizeSearchCriteria(criteria);
    this.selectedService
      .paginateLicensesSearch(criteria)
      .subscribe((pagination: Pagination<CaseModel<any, any>[]>) => {
        pagination.rs.forEach(item => {
          item.searchFields = { ...item.searchFields, arName: 'arName', enName: 'enName' }
        })
        this.results = pagination.rs as LicenseApprovalModel<any, any>[];
        this.count = pagination.count;
        this.results = this.results.map(x => GeneralInterceptor.receive(x))
        if (this.results.length) {
          this.tabIndex$.next(1);
        } else {
          this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
        }
      });
  }

  private normalizeSearchCriteria(criteria: any): any {
    return {
      ...(GeneralInterceptor.send(new GeneralSearchCriteriaInterceptor().send(criteria))),
      caseType: (new (this.selectedService._getModel() as unknown as IServiceConstructor)).caseType
    };
  }

  private listenToServiceChange(serviceNumber?: number) {
    this.serviceControl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(startWith(serviceNumber))
      .pipe(filter(val => !!val))
      .pipe(map(val => Number(val)))
      .pipe(map(val => this.inboxService.getService(val)))
      .subscribe((service: BaseGenericEService<any>) => {
        this.selectedService = service;
        this.results = [];
        this.form.reset();
        this.setDefaultDates();
      });
  }
  private _loadSearchFields() {
    this.http.get<IFormRowGroup[]>('assets/search/admin_license.json')
      .pipe(
        map((rows: IFormRowGroup[]) => {
          for (const row of rows) {
            if (!row.fields) {
              row.fields = [];
            }
          }
          rows = rows.filter(x => x.fields && x.fields.length > 0);
          return FBuilder.castFormlyFields(rows)
        }))
      .subscribe((fields) => {
        this.stringifyDefaultDates(fields[0]);
        this.fields = fields;
        this.setOldValues();
        this.getFieldsNames(fields);
      });;
  }

  actionExportLicense(item: LicenseApprovalModel<any, any>) {
    this.licenseService.showLicenseContent({ id: item.id }, item.caseType)
      .subscribe((blob) => {
        window.open(blob.url);
        this.search$.next(null);
      });
  }
  private buildGridActions() {
    this.actions = [
      // history
      {
        type: 'action',
        icon: ActionIconsEnum.HISTORY,
        label: 'inspection_history',
        onClick: (item: LicenseApprovalModel<any, any>) => this._loadHistory(item)
      },

      // followup
      {
        type: 'action',
        icon: ActionIconsEnum.APPROVE,
        label: 'followup',
        onClick: (item: LicenseApprovalModel<any, any>) => this.followup(item)
      },

    ];
  }
  followup(item: LicenseApprovalModel<any, any>): void {
    this.actualInspectionService
      .showCreateActualInspectionPopup(ActualInspectionCreationSource.FOLLOW_UP_SOURCE,
        new ActualInspection())
      .pipe(
        take(1),
      ).subscribe(model => {
        if (model) {
          this.toast.success(this.lang.map.msg_save_success);
        }
      })

  }
  private _loadHistory(item: LicenseApprovalModel<any, any>) {
    this.licenseActivityService.getHistory(item.fullSerial)
      .pipe(
        take(1)
      )
      .subscribe((logs: InspectionLog[]) => {
        this.dialog.show<IDialogData<InspectionLog[]>>(InspectionLogsPopupComponent, {
          model: logs,
          operation: OperationTypes.VIEW
        })
      })
  }

  private formInvalidMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private fillFormMessage() {
    this.dialog.error(this.lang.map.at_least_one_field_should_be_filled.change({ fields: '' }));
  }

  private prepareCriteriaModel() {
    const caseModel = (this.selectedService.getSearchCriteriaModel().clone(this.form.value)) as CaseModel<any, any>;
    caseModel.pageSize = this.pageEvent.pageSize;
    caseModel.pageNumber = this.pageEvent.pageIndex

    return caseModel;
  }

  private listenToSearch() {
    const validForm$ = this.search$
      .pipe(skip(1))
      .pipe(filter(_ => this.form.valid))
      .pipe(map(_ => this.prepareCriteriaModel()));



    const invalidForm$ = this.search$.pipe(filter(_ => this.form.invalid));
    const validEmptyForm$ = validForm$.pipe(filter(model => !model.criteriaHasValues()));

    const validFormWithValue$ = validForm$.pipe(
      filter(model => model.criteriaHasValues()),
      map(model => model.filterSearchFields())
    );

    validFormWithValue$.subscribe((value) => this.search(value));
    invalidForm$.subscribe(() => this.formInvalidMessage());
    validEmptyForm$.subscribe(() => this.fillFormMessage());
  }

  getServiceName(service: number) {
    let serviceKey: keyof ILanguageKeys;
    try {
      serviceKey = this.inboxService.getService(service).serviceKey;
    } catch (e) {
      console.error(`Please register your service inside the inboxService with number {${service}}`);
      return '';
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }

  get selectedServiceKey(): keyof ILanguageKeys {
    if (!this.selectedService) {
      return 'service_name';
    }
    return this.selectedService.serviceKey;
  }

  resetCriteria() {
    this.form.reset();
    this.setDefaultDates();
  }

  selectedTabChanged($event: TabComponent) {
    $event.name === 'result_tab' ? this.serviceControl.disable({ emitEvent: false }) : this.serviceControl.enable({ emitEvent: false });
  }


  stringifyDefaultDates(field?: FormlyFieldConfig): void {
    if (field?.fieldGroup) {
      this.defaultDates = JSON.stringify(field.fieldGroup!.reduce((prev, item) => {
        return { ...prev, [(item.key as string)]: item.defaultValue };
      }, {} as any));
    }
  }

  private setDefaultDates(): void {
    if (this.defaultDates) {
      let dates = <Record<string, any>>(JSON.parse(this.defaultDates));
      Object.keys(dates).forEach((key: string) => {
        let date = dates[key] as any;
        date.singleDate.jsDate = new Date(date.singleDate.jsDate);
        this.form.get(key)?.patchValue(date);
      });
    }
  }

  // noinspection JSUnusedLocalSymbols
  private reSelectService() {
    const selectedService = parseInt(this.activatedRoute.snapshot.params['caseType']);
    if (isNaN(selectedService)) {
      return;
    }
    this.serviceControl.patchValue(selectedService);
  }

  private getFieldsNames(fields: FormlyFieldConfig[]) {
    this.fieldsNames = fields.map(group => group.fieldGroup).reduce((list, row) => {
      return row ? list.concat(row.map(field => (field.key as string))) : list;
    }, [] as string[]).concat('caseType');
  }

  private setOldValues(): void {
    if (this.oldValuesAssigned) {
      return;
    }
    const controls = Object.keys(this.activatedRoute.snapshot.params);
    const oldValues = this.activatedRoute.snapshot.params;
    if (!controls.length) {
      this.oldValuesAssigned = true;
      return;
    }
    setTimeout(() => {
      Object.entries(this.form.controls).forEach(([key, control]) => {
        if (oldValues.hasOwnProperty(key)) {
          (key === 'createdOnTo' || key === 'createdOnFrom') ? (control.patchValue({
            dateRange: undefined,
            isRange: false,
            singleDate: { jsDate: new Date(oldValues[key]) }
          })) : control.patchValue(isNaN(Number(oldValues[key])) ? oldValues[key] : Number(oldValues[key]));
        }
      });
      this.search$.next(null);
      this.oldValuesAssigned = true;
    });
  }
  pageEvent: PageEvent = {
    pageIndex: 1,
    pageSize: 10,
    length: 0,
    previousPageIndex: null
  }
  count: number = 0;

  private _isFormBuilt(): boolean {
    return Object.keys(this.form.controls).length > 0
  }
  pageChange($event: PageEvent): void {
    if (!this._isFormBuilt()) return;
    $event.pageIndex++;
    this.pageEvent = $event

    const model = this.prepareCriteriaModel()
    this.search(model)
  }
  private _resetPaginationResults() {
    this.pageEvent.pageIndex = 1;
    this.pageEvent.pageSize = 10;
    this.count = 0;
  }
}
