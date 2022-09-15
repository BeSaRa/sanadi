import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CharityReportInterceptor } from '@app/model-interceptors/charity-report-interceptor';
import { CharityReportService } from '@app/services/charity-report.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDate, IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { BaseModel } from './base-model';

const interceptor = new CharityReportInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send,
})
export class CharityReport extends BaseModel<
  CharityReport,
  CharityReportService
> {
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
      feedback,
      reportStatus,
    } = this;
    return {
      fullName: controls ? [fullName, [CustomValidators.required]] : fullName,
      generalDate: controls
        ? [generalDate, [CustomValidators.required]]
        : generalDate,
      riskType: controls ? [riskType, [CustomValidators.required]] : riskType,
      category: controls ? [category, [CustomValidators.required]] : category,
      riskMitigationMeasures: controls
        ? [riskMitigationMeasures, [CustomValidators.required]]
        : riskMitigationMeasures,
      feedback: controls ? [feedback, [CustomValidators.required]] : feedback,
      reportStatus: controls
        ? [reportStatus, [CustomValidators.required]]
        : reportStatus,
    };
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
      reportType
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
