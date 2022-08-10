import {BaseModel} from '@app/models/base-model';
import {FollowupService} from '@app/services/followup.service';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';
import {ISearchFieldsMap, searchFunctionType} from '@app/types/types';
import {INames} from '@app/interfaces/i-names';
import {Lookup} from '@app/models/lookup';
import {IDescriptions} from '@app/interfaces/I-descriptions';
import {CustomValidators} from '@app/validators/custom-validators';
import {FollowupInterceptor} from '@app/model-interceptors/followup.interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {FollowUpType} from '@app/enums/followUp-type.enum';
import {Observable} from 'rxjs';
import {FollowupStatusEnum} from '@app/enums/status.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {dateSearchFields} from '@helpers/date-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';

const interceptor = new FollowupInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class Followup extends BaseModel<Followup, FollowupService> {
  service: FollowupService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('FollowupService');
    this.langService = FactoryService.getService('LangService');
  }

  orgId!: number;
  followUpConfigurationId!: number;
  caseType!: number;
  caseId!: string;
  requestType!: string;
  arDesc!: string;
  enDesc!: string;
  followUpType!: number;
  responsibleTeamId!: number;
  concernedTeamId!: number;
  status!: number;
  statusDateModified!: string;
  dueDate!: string;
  reason?: string;
  custom: boolean = true;
  fullSerial!: string;
  followUpConfigurationInfo!: Lookup;
  followUpTypeInfo!: Lookup;
  serviceInfo!: Lookup;
  statusInfo!: Lookup;
  orgInfo!: Lookup;
  requestTypeInfo!: AdminResult;

  searchFields: ISearchFieldsMap<Followup> = {
    ...normalSearchFields(['arName', 'enName', 'fullSerial']),
    ...infoSearchFields(['statusInfo', 'requestTypeInfo', 'serviceInfo', 'orgInfo']),
    ...dateSearchFields(['dueDate'])
  };

  public getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames] || '';
  }

  getDesc(): string {
    return this[(this.langService.map.lang + 'Desc') as keyof IDescriptions];
  }

  getCreatedBy(): string {
    return (this.custom ? this.langService.map.manually : this.langService.map.system) || '';
  }

  buildForm(controls: boolean = false): any {
    const {
      arName,
      enName,
      arDesc,
      enDesc,
      followUpType,
      responsibleTeamId,
      concernedTeamId,
      dueDate
    } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required, CustomValidators.pattern('AR_NUM')]] : arName,
      enName: controls ? [enName, [CustomValidators.required, CustomValidators.pattern('ENG_NUM')]] : enName,
      arDesc: controls ? [arDesc, [CustomValidators.required, CustomValidators.pattern('AR_NUM')]] : arDesc,
      enDesc: controls ? [enDesc, [CustomValidators.required, CustomValidators.pattern('ENG_NUM')]] : enDesc,
      followUpType: controls ? [followUpType, [CustomValidators.required]] : followUpType,
      responsibleTeamId: controls ? [{
        value: responsibleTeamId,
        disabled: followUpType === FollowUpType.INTERNAL
      }] : responsibleTeamId,
      concernedTeamId: controls ? [{
        value: concernedTeamId,
        disabled: followUpType === FollowUpType.EXTERNAL
      }] : concernedTeamId,
      dueDate: controls ? [dueDate, [CustomValidators.required]] : dueDate
    };
  }

  rejectTerminate(): Observable<string> {
    return this.service.rejectTerminate(this);
  }

  hasReason(): boolean {
    return !!(this.reason && this.reason.length) && this.status !== FollowupStatusEnum.PARTIAL_TERMINATION;
  }

  getReason(): string {
    return this.langService.map.terminate_reject_reason + ' : ' + this.reason;
  }

  updateDueDate(): DialogRef {
    return this.service.openUpdateDueDate(this);
  }

}
