import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CaseTypes } from '@app/enums/case-types.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { CaseModel } from '@app/models/case-model';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { CaseModelContract } from './../contracts/case-model-contract';
import { WFResponseType } from './../enums/wfresponse-type.enum';
import { HasLicenseDurationType } from './../interfaces/has-license-duration-type';
import { HasRequestType } from './../interfaces/has-request-type';
import { GeneralProcessNotificationInterceptor } from './../model-interceptors/generalProcessNotificationInterceptor';
import { FactoryService } from './../services/factory.service';
import { GeneralProcessNotificationService } from './../services/general-process-notification.service';
import { DialogRef } from './../shared/models/dialog-ref';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { CustomValidators } from './../validators/custom-validators';
import { AdminResult } from './admin-result';
import { TemplateField } from './template-field';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new GeneralProcessNotificationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class GeneralProcessNotification
  extends _RequestType<GeneralProcessNotificationService, GeneralProcessNotification>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<GeneralProcessNotificationService, GeneralProcessNotification>, IAuditModelProperties<GeneralProcessNotification> {
  service!: GeneralProcessNotificationService;
  caseType: number = CaseTypes.GENERAL_PROCESS_NOTIFICATION;
  // basic data
  requestType!: number;

  description!: string;
  projectDescription!: string;

  departmentId!: number;
  competentDepartmentID!: number;
  domain!: number;
  firstSubDomain!: number;
  processid!: number;
  projectName!: string;
  needSubject!: string;
  processType!: number;
  template!: string;
  competentDepartmentAuthName!:string;

  followUpDate!: string | IMyDateModel;
  subject!: string;
  fullSerial!: string;
  oldFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;

  subTeam!: AdminResult;
  departmentInfo!: AdminResult;
  mainClassInfo!: AdminResult;
  subClassInfo!: AdminResult;
  processTypeInfo!: AdminResult;
  parsedTemplates: TemplateField[] = [];


  searchFields: ISearchFieldsMap<GeneralProcessNotification> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial', 'subject'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService("GeneralProcessNotificationService");
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getAdminResultByProperty(property: keyof GeneralProcessNotification): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'competentDepartmentAuthName':
        adminResultValue = this.subTeam;
        break;
      case 'departmentId':
        adminResultValue = this.departmentInfo;
        break;
      case 'domain':
        adminResultValue = this.mainClassInfo;
        break;
      case 'firstSubDomain':
        adminResultValue = this.subClassInfo;
        break;
      case 'processType':
        adminResultValue = this.processTypeInfo;
        break;
      case 'processid':
        adminResultValue = this.service.processList.find(x => x.id === this.processid)?.createAdminResult() ?? AdminResult.createInstance({});
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: {langKey: 'request_type', value: this.requestType},
    }
  }

  getDSNNNValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      projectDescription: {langKey: 'project_description', value: this.projectDescription},
      departmentId: {langKey: 'department', value: this.departmentId},
      competentDepartmentAuthName: {langKey: 'lbl_sub_team', value: this.competentDepartmentAuthName},
      domain: {langKey: 'classification', value: this.domain},
      firstSubDomain: {langKey: 'sub_classification', value: this.firstSubDomain},
      processid: {langKey: 'lbl_process', value: this.processid},
      projectName: {langKey: 'lbl_process_name', value: this.projectName},
      processType: {langKey: 'lbl_process_type', value: this.processType},
      needSubject: {langKey: 'lbl_process_subject', value: this.needSubject},
    }
  }

  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
    }
  }

  buildForm(controls?: boolean) {
    const {
      requestType,
      description,
      oldFullSerial,
      projectDescription,
      departmentId,
      competentDepartmentAuthName,
      domain,
      firstSubDomain,
      processid,
      projectName,
      processType,
      needSubject,
    } = this;

    return {
      requestType: controls ? [requestType, CustomValidators.required] : requestType,
      oldFullSerial: controls ? [oldFullSerial] : oldFullSerial,
      description: controls ? [description, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)] : description,
      DSNNN: {
        departmentId: controls ? [departmentId] : departmentId,
        competentDepartmentAuthName: controls ? [competentDepartmentAuthName] : competentDepartmentAuthName,
        domain: controls ? [domain] : domain,
        firstSubDomain: controls ? [firstSubDomain] : firstSubDomain,
        processType: controls ? [processType] : processType,
        processid: controls ? [processid, CustomValidators.required] : processid,
        projectName: controls ? [projectName, CustomValidators.required] : projectName,
        needSubject: controls ? [needSubject, CustomValidators.required] : needSubject,
        projectDescription: controls ? [projectDescription, CustomValidators.required] : projectDescription,
      },
      sampleDataForOperations: {},
    }
  }

  buildApprovalForm(control: boolean = false): any {
    const {
      followUpDate
    } = this;
    return {
      followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
    }
  }

  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE)
  }

  finalApprove(): DialogRef {
    return this.service.approve(this, WFResponseType.FINAL_APPROVE)
  }
}
