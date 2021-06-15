import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {LangService} from '../services/lang.service';
import {EServiceListService} from '../services/e-service-list.service';
import {InboxService} from '../services/inbox.service';
import {Subject} from 'rxjs';
import {filter, map, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {CaseModel} from '../models/case-model';
import {DialogService} from '../services/dialog.service';
import {IMenuItem} from '../modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'services-search',
  templateUrl: './services-search.component.html',
  styleUrls: ['./services-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicesSearchComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();
  private selectedService!: EServiceGenericService<any>;
  searchColumns: string[] = [];
  form!: FormGroup;
  fields: FormlyFieldConfig[] = [];
  serviceNumbers: number[] = Array.from(this.eService.services.keys());
  serviceControl: FormControl = new FormControl(this.serviceNumbers[0]);
  results: CaseModel<any, any>[] = [];
  actions: IMenuItem[] = [];
  search$: Subject<any> = new Subject<any>();
  tabIndex$: Subject<number> = new Subject<number>();

  constructor(public lang: LangService,
              private inboxService: InboxService,
              private dialog: DialogService,
              public eService: EServiceListService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.buildGridActions();
  }

  ngOnInit(): void {
    this.form = new FormGroup({});
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
        this.selectedService = service;
        this.searchColumns = this.selectedService.searchColumns;
        this.results = [];
        this.selectedService
          .loadSearchFields()
          .subscribe((fields) => {
            this.fields = fields;
          });
      });
  }

  actionViewLogs(item: CaseModel<any, any>) {
    item.viewLogs().onAfterClose$.subscribe(() => this.search$.next(null));
  }

  actionOpen(item: CaseModel<any, any>) {
    item.open(this.actions)
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

  private exportModel(item: CaseModel<any, any>) {
    item.exportModel().subscribe((blob) => {
      window.open(blob.url);
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
          this.exportModel(item);
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
    return this.eService.services.get(service)!.getName();
  }

  resetCriteria() {
    this.form.reset();
  }
}
