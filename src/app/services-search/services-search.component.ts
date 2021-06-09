import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {LangService} from '../services/lang.service';
import {EServiceListService} from '../services/e-service-list.service';
import {InboxService} from '../services/inbox.service';
import {Subject} from 'rxjs';
import {filter, map, startWith, takeUntil} from 'rxjs/operators';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {CaseModel} from '../models/case-model';
import {DialogService} from '../services/dialog.service';

@Component({
  selector: 'services-search',
  templateUrl: './services-search.component.html',
  styleUrls: ['./services-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicesSearchComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  fields: FormlyFieldConfig[] = [];
  serviceNumbers: number[] = Array.from(this.eService.services.keys());
  serviceControl: FormControl = new FormControl(this.serviceNumbers[0]);
  private destroy$: Subject<any> = new Subject<any>();
  private selectedService!: EServiceGenericService<any>;

  constructor(public lang: LangService,
              private inboxService: InboxService,
              private dialog: DialogService,
              public eService: EServiceListService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.form = new FormGroup({});
    this.listenToServiceChange(this.serviceControl.value);
  }

  search() {
    const model = this.selectedService.getSearchCriteriaModel().clone(this.form.value) as CaseModel<any, any>;
    if (!model.criteriaHasValues()) {
      this.dialog.error(this.lang.map.at_least_one_field_should_be_filled.change({fields: ''}));
      return;
    }
    if (this.form.invalid) {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
      return;
    }

    this.selectedService
      .search(model)
      .subscribe((results: CaseModel<any, any>[]) => {
        console.log('results', results);
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
        this.selectedService.loadSearchFields().subscribe((fields) => {
          this.fields = fields;
        });
      });
  }
}
