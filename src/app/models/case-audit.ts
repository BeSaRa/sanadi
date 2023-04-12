import {CaseAuditInterceptor} from '@model-interceptors/case-audit-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CaseModel} from '@models/case-model';

const {send, receive} = new CaseAuditInterceptor();

@InterceptModel({send, receive})
export class CaseAudit {
  id!: number;
  auditDate!: string;
  operation!: number;
  caseId!: string;
  version!: number;
  caseObject!: string;

  //extra properties
  auditDateString!: string;
  caseObjectParsed!: CaseModel<any, any>;
}
