import { EmployeeFormPopupComponent } from "./../e-services/poups/employee-form-popup/employee-form-popup.component";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { JobApplicationSearchCriteria } from "./../models/job-application-search-criteria";
import { JobApplicationInterceptor } from "./../model-interceptors/job-application-interceptor";
import { FactoryService } from "./factory.service";
import { JobApplication } from "./../models/job-application";
import { BaseGenericEService } from "@app/generics/base-generic-e-service";
import { ComponentFactoryResolver, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { DialogService } from "./dialog.service";
import { DynamicOptionsService } from "./dynamic-options.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root",
})
export class JobApplicationService extends BaseGenericEService<JobApplication> {
  searchColumns: string[] = [];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([]);
  jsonSearchFile: string = "job_application_search-form.json";
  serviceKey: keyof ILanguageKeys = "job_application";

  interceptor: IModelInterceptor<JobApplication> =
    new JobApplicationInterceptor();

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

  openAddNewEmployee(): DialogRef {
    return this.dialog.show(
      EmployeeFormPopupComponent,
      {
        service: this,
      },
      {fullscreen: true}
    );
  }
  _getURLSegment(): string {
    return this.urlService.URLS.E_JOB_APPLICATIONS;
  }
  _getInterceptor(): Partial<IModelInterceptor<JobApplication>> {
    return this.interceptor;
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
