import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ProfileTypes } from '@app/enums/profile-types.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { FinancialAnalysisInterceptor } from '@app/model-interceptors/financial-analysis-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { FactoryService } from '@app/services/factory.service';
import { FinancialAnalysisService } from '@app/services/financial-analysis.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { EmployeeService } from '@services/employee.service';
import { Observable } from 'rxjs';
import { FileNetDocument } from './file-net-document';
import { LicenseApprovalModel } from './license-approval-model';

const { send, receive } = new FinancialAnalysisInterceptor();

@InterceptModel({ send, receive })
export class FinancialAnalysis extends LicenseApprovalModel<
  FinancialAnalysisService,
  FinancialAnalysis
> implements IAuditModelProperties<FinancialAnalysis> {
  caseType: number = CaseTypes.FINANCIAL_ANALYSIS;
  organizationId!: number;
  year!: number;
  reportTypeId!: number;
  subject!: string;
  description!: string;
  reportPeriodicity!: number;
  quarterType!: number;
  halfType!: number;
  externalOfficeId!: number;
  profileType!:number;

  reportPeriodicityInfo!: AdminResult;
  quarterTypeInfo!: AdminResult;
  halfTypeInfo!: AdminResult;
  externalOfficeIdInfo!: AdminResult;

  service: FinancialAnalysisService;
  employeeService: EmployeeService;

  searchFields: ISearchFieldsMap<FinancialAnalysis> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields([
      'ouInfo',
      'requestTypeInfo',
      'caseStatusInfo',
      'creatorInfo',
    ]),
    ...normalSearchFields(['fullSerial', 'subject']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService(
      'FinancialAnalysisService'
    );
    this.employeeService = FactoryService.getService('EmployeeService');
    this.finalizeSearchFields();
    this._setDefaultValues();
  }

  private _setDefaultValues() {
    if(this.employeeService.isExternalUser()){
      this.organizationId = this.employeeService.getCurrentUser().getProfileId()!;
      this.profileType = this.employeeService.getProfile()?.profileType ?? ProfileTypes.CHARITY;
    }
  }
  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getAdminResultByProperty(property: keyof FinancialAnalysis): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'reportPeriodicity':
        adminResultValue = this.reportPeriodicityInfo;
        break;
      case 'quarterType':
        adminResultValue = this.quarterTypeInfo;
        break;
      case 'halfType':
        adminResultValue = this.halfTypeInfo;
        break;
      case 'externalOfficeId':
        adminResultValue = this.externalOfficeIdInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      oldLicenseSerial: { langKey: 'serial_number', value: this.oldLicenseFullSerial },
      reportPeriodicity: { langKey: {} as keyof ILanguageKeys, value: this.reportPeriodicity },
      quarterType: { langKey: {} as keyof ILanguageKeys, value: this.quarterType },
      halfType: { langKey: {} as keyof ILanguageKeys, value: this.halfType },
      year: { langKey: {} as keyof ILanguageKeys, value: this.year },
      reportTypeId: { langKey: {} as keyof ILanguageKeys, value: this.reportTypeId },
      externalOfficeId: { langKey: {} as keyof ILanguageKeys, value: this.externalOfficeId },
    };
  }
  getBasicInfoFields(control = false): any {
    const {
      requestType,
      oldLicenseId,
      oldLicenseSerial,
      reportPeriodicity,
      quarterType,
      halfType,
      year,
      reportTypeId,
      externalOfficeId
    } = this;

    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      reportPeriodicity: control ? [reportPeriodicity, [CustomValidators.required]] : reportPeriodicity,
      year: control ? [year, [CustomValidators.required]] : year,
      halfType: control ? [halfType, []] : halfType,
      quarterType: control ? [quarterType, []] : quarterType,
      reportTypeId: control ? [reportTypeId, [CustomValidators.required]] : reportTypeId,
      externalOfficeId: control ? [externalOfficeId, []] : externalOfficeId,
    };
  }

  buildApprovalForm(control: boolean = false): any {
    const {
      followUpDate
    } = this;
    return {
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }
  convertToFinancialAnalysis() {
    return new FinancialAnalysis().clone({
      caseType: CaseTypes.FINANCIAL_TRANSFERS_LICENSING,
      organizationId: this.organizationId,
      requestType: this.requestType,
      subject: this.subject,
      description: this.description,
      reportPeriodicity: this.reportPeriodicity,
      quarterType: this.quarterType,
      halfType: this.halfType,
      year: this.year,
      reportTypeId: this.reportTypeId,
      externalOfficeId: this.externalOfficeId,
    });
  }
  // approve(): DialogRef {
  //   return this.service.approve(this, WFResponseType.APPROVE)
  // }

  getSpecialExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }
  getSpecialExplanationFields(control = false): any {
    const {
      description
    } = this;

    return {
      description: control ? [description, [CustomValidators.required]] : description,
    };
  }
  addReport(caseId: string,
    document: FileNetDocument,
    progressCallback?: (percentage: number) => void): Observable<FileNetDocument> {

    return this.service.addReport(caseId, document, this.reportTypeId);
  }
}
