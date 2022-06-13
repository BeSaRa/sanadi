import { Employee } from './../models/employee';
import { CastResponseContainer } from "@decorators/cast-response";
import { FormGroup } from "@angular/forms";
import { EmployeeFormPopupComponent } from "./../e-services/poups/employee-form-popup/employee-form-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { JobApplicationSearchCriteria } from "./../models/job-application-search-criteria";
import { FactoryService } from "./factory.service";
import { JobApplication } from "./../models/job-application";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
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

@CastResponseContainer({
  $default: { model: () => JobApplication },
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
  ];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([]);
  jsonSearchFile: string = "job_application_search-form.json";
  serviceKey: keyof ILanguageKeys = "menu_job_application";
  onSubmit: EventEmitter<Employee[]> = new EventEmitter();

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

  openAddNewEmployee(form: FormGroup, employees: Employee[]): DialogRef {
    return this.dialog.show(
      EmployeeFormPopupComponent,
      {
        service: this,
        parentForm: form,
        employees,
      },
      { fullscreen: true }
    );
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
