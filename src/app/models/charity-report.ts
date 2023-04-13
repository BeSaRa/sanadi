import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityReportInterceptor } from '@app/model-interceptors/charity-report-interceptor';
import { CharityReportService } from '@app/services/charity-report.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDate, IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';

const interceptor = new CharityReportInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class CharityReport extends BaseModel<
  CharityReport,
  CharityReportService
> implements IAuditModelProperties<CharityReport> {
  service: CharityReportService = FactoryService.getService(
    'CharityReportService'
  );
  langService: LangService = FactoryService.getService('LangService');
  charityId!: number;
  reportType!: number;
  fullName!: string;
  subject!: string;
  generalDate!: string | IMyDateModel;
  category!: number;
  feedback!: string;
  reportStatus!: number;
  procedures!: string;
  riskMitigationMeasures!: string;
  riskType!: number;
  id!: number;
  objectDBId?: number;
  categoryInfo!: AdminResult;
  reportStatusInfo!: AdminResult;
  riskTypeInfo!: AdminResult;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getAdminResultByProperty(property: keyof CharityReport): AdminResult {
    return AdminResult.createInstance({});
  }

  getName(): string {
    return this.langService.map.lang === 'en' ? this.enName : this.arName;
  }
  buildForm(controls = true) {
    const {
      fullName,
      generalDate,
      riskType,
      category,
      riskMitigationMeasures,
      subject,
      feedback,
      reportStatus,
    } = this;
    return {
      fullName: controls
        ? [
          fullName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : fullName,
      generalDate: controls
        ? [generalDate, [CustomValidators.required]]
        : generalDate,
      feedback: controls
        ? [
          feedback,
          [CustomValidators.required, CustomValidators.maxLength(1000)],
        ]
        : feedback,
      reportStatus: controls
        ? [reportStatus, [CustomValidators.required]]
        : reportStatus,
    };
  }

  buildRiskForm(controls = true) {
    const mainForm = this.buildForm();
    const { riskType, riskMitigationMeasures, category } = this;
    return {
      ...mainForm,
      category: controls ? [category, [CustomValidators.required]] : category,
      riskMitigationMeasures: controls
        ? [
          riskMitigationMeasures,
          [CustomValidators.required, CustomValidators.maxLength(1000)],
        ]
        : riskMitigationMeasures,
      riskType: controls ? [riskType, [CustomValidators.required]] : riskType,
    };

  }
  buildSupportForm(controls = true) {
    const mainForm = this.buildForm();
    const { category, subject, procedures } = this;
    return {
      ...mainForm,
      category: controls ? [category, [CustomValidators.required]] : category,
      subject: controls ? [subject, [CustomValidators.required, CustomValidators.maxLength(1000)]] : subject,
      procedures: controls ? [procedures, [CustomValidators.required, CustomValidators.maxLength(1000)]] : procedures
    };
  }
  buildFormWithSubject() {
    const { category, ...form } = this.buildSupportForm();
    return form;
  }
  toCharityOrganizationUpdate() {
    const {
      id,
      fullName,
      subject,
      generalDate,
      category,
      feedback,
      procedures,
      reportStatus,
      riskType,
      riskMitigationMeasures,
      reportType,
    } = this;
    return new CharityReport().clone({
      objectDBId: id,
      fullName,
      reportType,
      subject,
      generalDate,
      category,
      feedback,
      procedures,
      reportStatus,
      riskType,
      riskMitigationMeasures,
    });
  }
}
