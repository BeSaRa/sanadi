import {ISearchFieldsMap} from '@app/types/types';
import {AdminResult} from '@models/admin-result';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {InterceptModel} from '@decorators/intercept-model';
import {ReportAuditInterceptor} from '@model-interceptors/report-audit-interceptor';

const { receive } = new ReportAuditInterceptor();
@InterceptModel({receive})
export class ReportAuditResult {
  protected langService: LangService;
  constructor() {
    this.langService = FactoryService.getService('LangService');
  }
  gdxServiceId!: number;
  arName!: string;
  enName!: string;
  actionTime!: string;
  profileId!: number;
  orgUserId!: number;
  benNationality!: number;
  benNationalityInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  profileInfo!: AdminResult;
  gdxServiceInfo!: AdminResult;
  qId!: string;
  requestFullSerial!: string;
  status!: boolean;

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }
  searchFields: ISearchFieldsMap<ReportAuditResult> = {};
}
