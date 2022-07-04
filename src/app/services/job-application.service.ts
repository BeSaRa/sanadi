import { JobTitle } from './../models/job-title';
import { Observable } from 'rxjs';
import { EmployeeInterceptor } from './../model-interceptors/employee-interceptor';
import { Generator } from '@app/decorators/generator';
import { Employee } from './../models/employee';
import { CastResponseContainer } from "@decorators/cast-response";
import { FormGroup } from "@angular/forms";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { JobApplicationSearchCriteria } from "./../models/job-application-search-criteria";
import { FactoryService } from "./factory.service";
import { JobApplication } from "./../models/job-application";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { CastResponse } from "@decorators/cast-response";
import { HasInterception } from "@decorators/intercept-model";
import {
  ComponentFactoryResolver,
  EventEmitter,
  Injectable,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { UrlService } from "./url.service";
import { EmployeeFormPopupComponent } from '@app/modules/e-services-main/popups/employee-form-popup/employee-form-popup.component';

@CastResponseContainer({
  $employee: { model: () => Employee },
  $default: {
    model: () => JobApplication
  },
})
@Injectable({
  providedIn: "root",
})
export class JobApplicationService extends BaseGenericEService<JobApplication> {
  searchColumns: string[] = [
    "fullSerial",
    "caseStatus",
    "creatorInfo",
    "createdOn",
    "subject"
  ];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([]);
  jsonSearchFile: string = "job_application_search-form.json";
  serviceKey: keyof ILanguageKeys = "menu_job_application";
  onSubmit: EventEmitter<Partial<Employee>[]> = new EventEmitter();

  constructor(
    private urlService: UrlService,
    public http: HttpClient,
    public dialog: DialogService,
    public cfr: ComponentFactoryResolver,
    public domSanitizer: DomSanitizer,
    public dynamicService: DynamicOptionsService
  ) {
    super();
    FactoryService.registerService("JobApplicationService", this);
  }

  getCaseComponentName(): string {
    return "JobApplicationComponent";
  }

  openAddNewEmployee(form: FormGroup, employees: Partial<Employee>[], model: JobApplication | undefined, operation: number, jobTitleList: JobTitle[]): DialogRef {
    return this.dialog.show(
      EmployeeFormPopupComponent,
      {
        service: this,
        parentForm: form,
        employees,
        model,
        operation,
        jobTitleList
      },
      { fullscreen: true }
    );
  }

  // TODO: ask to to applay sup interceptor
  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$employee'
  })
  findEmployee(criteria: Partial<JobApplicationSearchCriteria>): Observable<Employee[]> {
    // =1&passport-number=1&is-manger=true
    return this.http.get<Employee[]>(this.urlService.URLS.NPO_EMPLOYEE + '/criteria?' +
      'q-id=' + criteria.identificationNumber +
      '&passport-number=' + criteria.passportNumber +
      '&is-manger=' + criteria.isManager
    )
  }
  _getURLSegment(): string {
    return this.urlService.URLS.E_JOB_APPLICATIONS;
  }
  _getModel() {
    return JobApplication;
  }
  getSearchCriteriaModel<S extends JobApplication>(): JobApplication {
    return new JobApplicationSearchCriteria();
  }
  _getUrlService(): UrlService {
    return this.urlService;
  }
}
