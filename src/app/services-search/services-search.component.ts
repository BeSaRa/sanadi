import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {LangService} from '../services/lang.service';
import {InboxService} from '../services/inbox.service';
import {Subject} from 'rxjs';
import {filter, map, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {CaseModel} from '../models/case-model';
import {DialogService} from '../services/dialog.service';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';
import {ToastService} from '../services/toast.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {OpenFrom} from '../enums/open-from.enum';
import {TabComponent} from '../shared/components/tab/tab.component';
import {EmployeeService} from '../services/employee.service';
import {CaseTypes} from '../enums/case-types.enum';
import {ILanguageKeys} from "@app/interfaces/i-language-keys";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigurationService} from '@app/services/configuration.service';

@Component({
  selector: 'services-search',
  templateUrl: './services-search.component.html',
  styleUrls: ['./services-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicesSearchComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private selectedService!: EServiceGenericService<any>;
  private allowedServicesForExternalUser: number[] = [
    CaseTypes.CONSULTATION,
    CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.PARTNER_APPROVAL,
    CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL,
    CaseTypes.INTERNAL_PROJECT_LICENSE
  ];

  searchColumns: string[] = [];
  form!: FormGroup;
  fields: FormlyFieldConfig[] = [];
  serviceNumbers: number[] = Array.from(this.inboxService.services.keys()).filter(caseType => this.filterServices(caseType));
  serviceControl: FormControl = new FormControl(this.serviceNumbers[0]);
  results: CaseModel<any, any>[] = [];
  actions: IMenuItem<CaseModel<any, any>>[] = [];
  search$: Subject<any> = new Subject<any>();
  tabIndex$: Subject<number> = new Subject<number>();
  defaultDates: string = '';

  get criteriaTitle(): string {
    return this.lang.map.search_result + (this.results.length ? " (" + this.results.length + ")" : '');
  };

  constructor(public lang: LangService,
              private toast: ToastService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private inboxService: InboxService,
              private employeeService: EmployeeService,
              private configService: ConfigurationService,
              private dialog: DialogService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.buildGridActions();
  }

  ngOnInit(): void {
    this.form = new FormGroup({});
    // this.listenToRouteParams();
    this.listenToServiceChange(this.serviceControl.value);
    this.listenToSearch();
    this.buildGridActions();
  }

  private search(value: Partial<CaseModel<any, any>>) {
    this.selectedService
      .search(this.selectedService.getSearchCriteriaModel().clone(value))
      .subscribe((results: CaseModel<any, any>[]) => {
        this.results = results;
        if (this.results.length) {
          this.tabIndex$.next(1);
        } else {
          this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
        }
      });
  }

  private listenToServiceChange(serviceNumber?: number) {
    this.serviceControl
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(startWith(serviceNumber))
      .pipe(filter(val => !!val))
      .pipe(map(val => Number(val)))
      .pipe(map(val => this.inboxService.getService(val)))
      .subscribe((service: EServiceGenericService<any>) => {
        // this.updateRoute();
        this.selectedService = service;
        this.searchColumns = this.selectedService.searchColumns;
        this.results = [];
        this.selectedService
          .loadSearchFields()
          .subscribe((fields) => {
            this.form.reset();
            this.stringifyDefaultDates(fields[0]);
            this.fields = fields;
          });
      });
  }

  actionViewLogs(item: CaseModel<any, any>) {
    item.viewLogs().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionOpen(item: CaseModel<any, any>) {
    item.open(this.actions, OpenFrom.SEARCH)
      .pipe(switchMap(ref => ref.onAfterClose$))
      .subscribe(() => this.search$.next(null));
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

  actionExportModel(item: CaseModel<any, any>) {
    item.exportModel().subscribe((blob) => {
      window.open(blob.url);
      this.search$.next(null);
    });
  }

  actionLaunch(item: CaseModel<any, any>, dialogRef?: DialogRef) {
    item.start().subscribe(_ => {
      this.toast.success(this.lang.map.request_has_been_sent_successfully);
      dialogRef?.close();
      this.search$.next(null);
    });
  }

  exportSearchResult(): void {
    const criteria = this.selectedService.getSearchCriteriaModel().clone(this.form.value).filterSearchFields();
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
        data: {hideFromViewer: true},
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
        data: {hideFromViewer: true},
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageAttachments(item);
        }
      },
      // recommendations
      {
        type: 'action',
        icon: 'mdi-star-settings',
        label: 'manage_recommendations',
        data: {hideFromViewer: true},
        show: (item: CaseModel<any, any>) => {
          return this.employeeService.isInternalUser() &&
            ![CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL, CaseTypes.PARTNER_APPROVAL, CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL].includes(item.caseType);
        },
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageRecommendations(item);
        }
      },
      // comments
      {
        type: 'action',
        icon: 'mdi-comment-text-multiple-outline',
        label: 'manage_comments',
        data: {hideFromViewer: true},
        onClick: (item: CaseModel<any, any>) => {
          this.actionManageComments(item);
        }
      },
      {
        type: 'action',
        icon: 'mdi-printer',
        label: 'print',
        onClick: (item: CaseModel<any, any>) => {
          this.actionExportModel(item);
        }
      },
      {type: 'divider'},
      {
        type: 'action',
        icon: 'mdi-rocket-launch-outline',
        label: 'launch',
        show: (item: CaseModel<any, any>) => item.canStart(),
        onClick: (item: CaseModel<any, any>, dialogRef: DialogRef) => {
          this.actionLaunch(item, dialogRef);
        }
      }
    ];
  }

  private formInvalidMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private fillFormMessage() {
    this.dialog.error(this.lang.map.at_least_one_field_should_be_filled.change({fields: ''}));
  }

  private prepareCriteriaModel() {
    return (this.selectedService.getSearchCriteriaModel().clone(this.form.value)) as CaseModel<any, any>;
  }

  private listenToSearch() {
    const validForm$ = this.search$
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
      console.error(`Please register your service inside the inboxService with number {${service}}`)
      return "";
    }
    return this.lang.getLocalByKey(serviceKey).getName();
  }

  resetCriteria() {
    this.form.reset();
    this.setDefaultDates();
  }

  selectedTabChanged($event: TabComponent) {
    $event.name === 'result_tab' ? this.serviceControl.disable({emitEvent: false}) : this.serviceControl.enable({emitEvent: false});
  }

  isConsultationSelected(): boolean {
    return this.serviceControl.value === CaseTypes.CONSULTATION;
  }

  stringifyDefaultDates(field: FormlyFieldConfig): void {
    this.defaultDates = JSON.stringify(field.fieldGroup!.reduce((prev, item) => {
      return {...prev, [(item.key as string)]: item.defaultValue};
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

  private filterServices(number: number): boolean {
    if (this.configService.CONFIG.hasOwnProperty('E_SERVICES_RESTRICTED_CASE_TYPES')) {
      if (this.configService.CONFIG.E_SERVICES_RESTRICTED_CASE_TYPES.includes(number)) {
        return false;
      }
    }
    return this.employeeService.isInternalUser() ? true : this.isServiceAllowedForExternalToSearch(number);
  }

  private isServiceAllowedForExternalToSearch(number: number) {
    return this.allowedServicesForExternalUser.indexOf(number) !== -1;
  }

  private listenToRouteParams() {
    this.activatedRoute.fragment.subscribe((serviceNumber) => {
      let service = serviceNumber ? Number(serviceNumber.split('-').pop()) : -1
      service && this.serviceNumbers.includes(service) && this.serviceControl.value !== service && this.serviceControl.patchValue(service);
    })
  }

  private updateRoute() {
    console.log(this.serviceControl.value);
    this.router.navigate([this.activatedRoute], {
      fragment: ("service-" + this.serviceControl.value)
    }).then((val) => console.log(val))
  }
}
