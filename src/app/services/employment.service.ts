import {WFResponseType} from './../enums/wfresponse-type.enum';
import {JobTitle} from './../models/job-title';
import {Observable} from 'rxjs';
import {EmployeeInterceptor} from './../model-interceptors/employee-interceptor';
import {Employee} from './../models/employee';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {EmploymentSearchCriteria} from './../models/employment-search-criteria';
import {FactoryService} from './factory.service';
import {Employment} from './../models/employment';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {HasInterception} from '@decorators/intercept-model';
import {ComponentFactoryResolver, EventEmitter, Injectable,} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {DialogService} from './dialog.service';
import {DynamicOptionsService} from './dynamic-options.service';
import {UrlService} from './url.service';
import {
  EmploymentApproveComponent
} from '@app/modules/services/employment/popups/employment-approve/employment-approve.component';
import { EmployeeFormPopupComponent } from '@app/modules/services/employment/popups/employee-form-popup/employee-form-popup.component';

const Empinterceptor = new EmployeeInterceptor();

@CastResponseContainer({
  $employee: {model: () => Employee},
  $default: {
    model: () => Employment
  },
  $validateEmployee: {
    model: () => Map
  }
})
@Injectable({
  providedIn: 'root',
})
export class EmploymentService extends BaseGenericEService<Employment> {
  searchColumns: string[] = ['fullSerial', 'requestTypeInfo', 'caseStatus', 'subject', 'creatorInfo', 'createdOn'];
  caseStatusIconMap: Map<number, string> = new Map<number, string>([]);
  jsonSearchFile: string = 'employment_search-form.json';
  serviceKey: keyof ILanguageKeys = 'menu_employment';
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
    FactoryService.registerService('EmploymentService', this);
  }

  getCaseComponentName(): string {
    return 'EmploymentComponent';
  }

  openAddNewEmployee(form: UntypedFormGroup, employees: Partial<Employee>[], model: Employment | undefined, operation: number, jobTitleList: JobTitle[]): DialogRef {
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
      {fullscreen: true}
    );
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$employee'
  })
  findEmployee(criteria: Partial<EmploymentSearchCriteria>): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.urlService.URLS.NPO_EMPLOYEE + '/criteria?' +
      'q-id=' + criteria.identificationNumber +
      '&passport-number=' + criteria.passportNumber +
      '&is-manger=' + criteria.isManager
    );
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$validateEmployee'
  })
  bulkValidate(employees: Partial<Employee>[]): Observable<any> {
    const employeesList = employees.map((e: any) => {
      const fakeObj = {...e};
      const emp = {
        ...Empinterceptor.send(fakeObj),
        qId: fakeObj.identificationType == 1 ? e.identificationNumber : '-1',
        passportNumber: fakeObj.identificationType == 2 ? fakeObj.passportNumber : null
      };
      delete emp.identificationNumber;
      return emp;
    });
    return this.http.post<any>(this.urlService.URLS.NPO_EMPLOYEE + '/bulk/validate', employeesList);
  }

  _getURLSegment(): string {
    return this.urlService.URLS.EMPLOYMENT;
  }

  _getModel() {
    return Employment;
  }

  getSearchCriteriaModel<S extends Employment>(): Employment {
    return new EmploymentSearchCriteria();
  }

  _getUrlService(): UrlService {
    return this.urlService;
  }

  approve(model: Employment, action: WFResponseType): DialogRef {
    return this.dialog.show(EmploymentApproveComponent, {
      model,
      action
    });
  }
}
