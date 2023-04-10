import {CaseTypes} from '@app/enums/case-types.enum';
import {ISearchFieldsMap} from '@app/types/types';
import {FactoryService} from '@services/factory.service';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';
import {LangService} from '@services/lang.service';
import {EmployeeService} from '@services/employee.service';
import {CaseModel} from '@app/models/case-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {InterceptModel} from '@decorators/intercept-model';
import {
  UrgentInterventionLicenseFollowupInterceptor
} from '@app/model-interceptors/urgent-intervention-license-followup-interceptor';
import {Observable} from 'rxjs';

const {send, receive} = new UrgentInterventionLicenseFollowupInterceptor();

@InterceptModel({send, receive})
export class UrgentInterventionLicenseFollowup extends CaseModel<any, any> {
  caseType: number = CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP;
  organizationId!: number;
  licenseApprovedDate!: string;
  exportedBookId!: string;
  licenseClassName!: string;

  // extra properties
  requestType: number = -1;
  searchFields: ISearchFieldsMap<UrgentInterventionLicenseFollowup> = {};

  service: UrgentInterventionLicenseFollowupService;
  langService: LangService;
  employeeService: EmployeeService;

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionLicenseFollowupService');
    this.langService = FactoryService.getService('LangService');
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getRequestType(): number {
    return this.requestType;
  }

  getBasicFormFields(controls: boolean = false): any {
    const {fullSerial} = this;
    return {
      fullSerial: controls ? [fullSerial, [CustomValidators.required, CustomValidators.maxLength(250)]] : fullSerial
    };
  }

  sendToSingleDepartmentReportReviewAction(): Observable<any> {
    const taskName = this.getAskSingleWFResponseByCaseType().split('askSingle:')[1];
    const reportId = this.taskDetails.activityProperties['ReportId'].value;
    return this.service.sendToSingleDepartmentReportReviewAction(taskName, reportId);
  }
}
