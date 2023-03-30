import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {INames} from '@contracts/i-names';
import {AdminResult} from '@app/models/admin-result';
import {UrgentInterventionReportInterceptor} from '@app/model-interceptors/urgent-intervention-report-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {BaseModel} from '@app/models/base-model';
import {UrgentInterventionReportService} from '@services/urgent-intervention-report.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {DateUtils} from '@helpers/date-utils';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';
import {Observable} from 'rxjs';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LookupService} from '@services/lookup.service';
import {ReportStatusEnum} from '@app/enums/report-status-enum';

const {send, receive} = new UrgentInterventionReportInterceptor();

@InterceptModel({send, receive})
export class UrgentInterventionReport extends BaseModel<UrgentInterventionReport, UrgentInterventionReportService>{
  caseId!: string;
  documentId!: string;
  serial  !: number;
  fullSerial!: string;
  status!: number;
  executionDate!: string;
  dueDate!: string;
  notes!: string;

  // extra properties
  service: UrgentInterventionReportService;
  urgentInterventionLicenseFollowupService: UrgentInterventionLicenseFollowupService;
  langService: LangService;
  lookupService: LookupService;
  statusInfo!: AdminResult;
  executionDateString!: string;

  searchFields: ISearchFieldsMap<UrgentInterventionReport> = {
    ...normalSearchFields(['arName', 'enName', 'executionDateString']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionReportService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
    this.urgentInterventionLicenseFollowupService = FactoryService.getService('UrgentInterventionLicenseFollowupService');
  }

  getName(): string {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      executionDate,
      dueDate,
      // notes
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      executionDate: controls ? [DateUtils.changeDateToDatepicker(executionDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(executionDate),
      dueDate: controls ? [DateUtils.changeDateToDatepicker(dueDate), [CustomValidators.required]] : DateUtils.changeDateToDatepicker(dueDate),
      // notes: controls ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]: notes
    }
  }

  showAttachments(readonly: boolean, isCurrentRequestReport: boolean): Observable<DialogRef> {
    return this.urgentInterventionLicenseFollowupService.openAttachmentsDialog(this.id, this.caseId, readonly, isCurrentRequestReport);
  }

  isApproved(): boolean {
    return this.status === ReportStatusEnum.APPROVED;
  }

  isLaunched(): boolean {
    return this.status === ReportStatusEnum.LAUNCHED;
  }

  launch(): Observable<boolean> {
    return this.urgentInterventionLicenseFollowupService.launchReport(this.id);
  }
}
