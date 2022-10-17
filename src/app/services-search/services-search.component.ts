import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core/lib/components/formly.field.config';
import { LangService } from '@services/lang.service';
import { InboxService } from '@services/inbox.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, skip, startWith, takeUntil } from 'rxjs/operators';
import { CaseModel } from '../models/case-model';
import { DialogService } from '@services/dialog.service';
import { IMenuItem } from '../modules/context-menu/interfaces/i-menu-item';
import { ToastService } from '@services/toast.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { TabComponent } from '../shared/components/tab/tab.component';
import { EmployeeService } from '@services/employee.service';
import { CaseTypes } from '../enums/case-types.enum';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService } from '@app/services/configuration.service';
import { GeneralSearchCriteriaInterceptor } from '@app/model-interceptors/general-search-criteria-interceptor';
import { GeneralInterceptor } from '@app/model-interceptors/general-interceptor';
import { IServiceConstructor } from '@app/interfaces/iservice-constructor';
import { LicenseService } from '@app/services/license.service';
import { HasLicenseApproval } from '@app/interfaces/has-license-approval';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { BaseGenericEService } from '@app/generics/base-generic-e-service';

@Component({
  selector: 'services-search',
  templateUrl: './services-search.component.html',
  styleUrls: ['./services-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicesSearchComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private selectedService!: BaseGenericEService<any>;

  searchColumns: string[] = [];
  headerColumn: string[] = ['extra-header'];
  form!: UntypedFormGroup;
  fields: FormlyFieldConfig[] = [];
  serviceNumbers: number[] = Array.from(this.inboxService.services.keys()).filter(caseType => this.employeeService.userCanManage(caseType));
  serviceControl: UntypedFormControl = new UntypedFormControl(this.serviceNumbers[0]);
  results: CaseModel<any, any>[] = [];
  actions: IMenuItem<CaseModel<any, any>>[] = [];
  search$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  tabIndex$: Subject<number> = new Subject<number>();
  defaultDates: string = '';
  fieldsNames: string[] = [];
  filter: string = '';
  searchState: any;
  oldValuesAssigned: boolean = false;

  get criteriaTitle(): string {
    return this.lang.map.search_result + (this.results.length ? ' (' + this.results.length + ')' : '');
  };


  constructor(public lang: LangService,
    private toast: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private inboxService: InboxService,
    private employeeService: EmployeeService,
    private configService: ConfigurationService,
    private licenseService: LicenseService,
    private dialog: DialogService) {
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
    this.listenToServiceChange(this.serviceControl.value);
    this.listenToSearch();
    this.buildGridActions();
  }

  private search(value: Partial<CaseModel<any, any>>) {
    const caseType = (this.selectedService.getSearchCriteriaModel()).caseType;
    let criteria = this.selectedService.getSearchCriteriaModel().clone(value).filterSearchFields(this.fieldsNames);
    criteria.caseType = caseType;
    this.searchState = this.normalizeSearchCriteria(criteria);
    this.selectedService
      .search(criteria)
      .subscribe((results: CaseModel<any, any>[]) => {
        this.results = results;
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
        // this.updateRoute();
        this.selectedService = service;
        this.searchColumns = this.selectedService.searchColumns;
        if (this.employeeService.isExternalUser()) {
          this.searchColumns = this.searchColumns.filter(x => x !== 'organization' && x !== 'organizationId' && x !== 'ouInfo');
        }
        this.results = [];
        this.selectedService
          .loadSearchFields()
          .subscribe((fields) => {
            this.form.reset();
            this.stringifyDefaultDates(fields[0]);
            this.fields = fields;
            this.setOldValues();
            this.getFieldsNames(fields);
          });
      });
  }

  actionViewLogs(item: CaseModel<any, any>) {
    item.viewLogs().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionOpen(item: CaseModel<any, any>) {
    /*item.open(this.actions, OpenFrom.SEARCH)
     .pipe(switchMap(ref => ref.onAfterClose$))
     .subscribe(() => this.search$.next(null));*/
    this.router.navigate([item.itemRoute, this.searchState], { queryParams: { item: item.itemDetails } }).then();
  }

  actionManageAttachments(item: CaseModel<any, any>) {
    item.manageAttachments().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionManageRecommendations(item: CaseModel<any, any>) {
    item.manageRecommendations().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionManageComments(item: CaseModel<any, any>) {
    item.manageComments().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionAddFollowup(item: CaseModel<any, any>) {
    item.addFollowup().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionExportModel(item: CaseModel<any, any>) {
    item.exportModel().subscribe((blob) => {
      window.open(blob.url);
      this.search$.next(null);
    });
  }

  actionExportLicense(exportedLicenseId: string, caseType: number) {
    this.licenseService.showLicenseContent({ id: exportedLicenseId }, caseType)
      .subscribe((blob) => {
        window.open(blob.url);
        this.search$.next(null);
      });
  }

  exportSearchResult(): void {
    let criteria = this.selectedService.getSearchCriteriaModel().clone(this.form.value).filterSearchFields(this.fieldsNames);
    criteria = this.normalizeSearchCriteria(criteria);
    this.selectedService
      .exportSearch(criteria)
      .subscribe((blob) => window.open(blob.url));
  }

  private buildGridActions() {
    this.actions = [
      // open
      {
        type: 'action',
        icon: 'mdi-eye',
        label: 'open_task',
        data: { hideFromViewer: true },
        onClick: (item: CaseModel<any, any>) => this.actionOpen(item)
      },
      // view logs
      {
        type: 'action',
        icon: 'mdi-view-list-outline',
        label: 'logs',
        onClick: (item: CaseModel<any, any>) => this.actionViewLogs(item)
      },
      // manage attachments
      {
        type: 'action',
        icon: 'mdi-paperclip',
        label: 'manage_attachments',
        data: { hideFromViewer: true },
        show: (item: CaseModel<any, any>) => {
          let caseStatus = item.getCaseStatus();
          return (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      {
        type: 'action',
        icon: 'mdi-star-settings',
        label: 'manage_recommendations',
        data: { hideFromViewer: true },
        show: (item: CaseModel<any, any>) => {
          return this.employeeService.isInternalUser() &&
            ![CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
            CaseTypes.PARTNER_APPROVAL,
            CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
            CaseTypes.INTERNAL_PROJECT_LICENSE,
            CaseTypes.EXTERNAL_PROJECT_MODELS,
            CaseTypes.URGENT_INTERVENTION_LICENSING].includes(item.caseType);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageRecommendations(item);
        }
      },
      // manage comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        data: { hideFromViewer: true },
        show: (item: CaseModel<any, any>) => {
          return this.employeeService.isInternalUser() && item.getCaseStatus() !== CommonCaseStatus.CANCELLED;
        },
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageComments(item);
        }
      },
      // print request
      {
        type: 'action',
        icon: 'mdi-printer',
        label: 'print',
        onClick: (item: CaseModel<any, any>) => {
          this.actionExportModel(item);
        }
      },
      // print generated license
      {
        type: 'action',
        icon: 'mdi-printer',
        label: 'print_license',
        show: (item: CaseModel<any, any>) => {
          if (!item.isFinalApproved()) {
            return false;
          }
          const caseTypesToPrint = [CaseTypes.URGENT_INTERVENTION_LICENSING, CaseTypes.FUNDRAISING_LICENSING, CaseTypes.URGENT_INTERVENTION_CLOSURE, CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION];
          return caseTypesToPrint.includes(item.getCaseType());
        },
        onClick: (item: CaseModel<any, any>) => {
          let licenseIdToShow = (item as unknown as HasLicenseApproval).exportedLicenseId;
          if (item.getCaseType() === CaseTypes.URGENT_INTERVENTION_CLOSURE) {
            licenseIdToShow = (item as unknown as HasLicenseApproval).licenseVSID;
          }
          this.actionExportLicense(licenseIdToShow, item.getCaseType());
        }
      },
      // followup
      {
        type: 'action',
        icon: 'mdi-format-align-left',
        label: 'followup',
        disabled: (item) => {
          return (!item.isFinalApproved() && !item.isInitialApproved());
        },
        show: () => {
          return this.employeeService.isInternalUser() && this.employeeService.hasPermissionTo('ADD_FOLLOWUP');
        },
        onClick: (item: CaseModel<any, any>) => {
          this.actionAddFollowup(item);
        }
      }
    ];
  }

  private formInvalidMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private fillFormMessage() {
    this.dialog.error(this.lang.map.at_least_one_field_should_be_filled.change({ fields: '' }));
  }

  private prepareCriteriaModel() {
    return (this.selectedService.getSearchCriteriaModel().clone(this.form.value)) as CaseModel<any, any>;
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
    return this.selectedService.serviceKey;
  }

  resetCriteria() {
    this.form.reset();
    this.setDefaultDates();
  }

  selectedTabChanged($event: TabComponent) {
    $event.name === 'result_tab' ? this.serviceControl.disable({ emitEvent: false }) : this.serviceControl.enable({ emitEvent: false });
  }

  isConsultationSelected(): boolean {
    return this.serviceControl.value === CaseTypes.CONSULTATION;
  }

  isCoordinationWithOrganizationSelected(): boolean {
    return this.serviceControl.value === CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST;
  }

  stringifyDefaultDates(field: FormlyFieldConfig): void {
    this.defaultDates = JSON.stringify(field.fieldGroup!.reduce((prev, item) => {
      return { ...prev, [(item.key as string)]: item.defaultValue };
    }, {} as any));
  }

  private setDefaultDates(): void {
    let dates = <Record<string, any>>(JSON.parse(this.defaultDates));
    Object.keys(dates).forEach((key: string) => {
      let date = dates[key] as any;
      date.singleDate.jsDate = new Date(date.singleDate.jsDate);
      this.form.get(key)?.patchValue(date);
    });
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
}
