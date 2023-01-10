import { AdminResult } from './admin-result';
import { WFResponseType } from './../enums/wfresponse-type.enum';
import { DialogRef } from './../shared/models/dialog-ref';
import { IMyDateModel } from 'angular-mydatepicker';
import { GeneralProcessNotificationInterceptor } from './../model-interceptors/generalProcessNotificationInterceptor';
import { GeneralProcessNotificationService } from './../services/general-process-notification.service';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { CustomValidators } from './../validators/custom-validators';
import { FactoryService } from './../services/factory.service';
import { ISearchFieldsMap } from './../types/types';
import { CaseModel } from '@app/models/case-model';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { HasRequestType } from './../interfaces/has-request-type';
import { HasLicenseDurationType } from './../interfaces/has-license-duration-type';
import { CaseModelContract } from './../contracts/case-model-contract';
import { CaseTypes } from '@app/enums/case-types.enum';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new GeneralProcessNotificationInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class GeneralProcessNotification
  extends _RequestType<GeneralProcessNotificationService, GeneralProcessNotification>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<GeneralProcessNotificationService, GeneralProcessNotification> {
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

  followUpDate!: string | IMyDateModel;
  subject!: string;
  fullSerial!: string;
  oldFullSerial!: string;
  oldLicenseId!: string;
  oldLicenseSerial!: number;

  subTeam!: AdminResult;

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

  buildForm(controls?: boolean) {
    const {
      requestType,
      description,
      oldFullSerial,
      projectDescription,
      departmentId,
      competentDepartmentID,
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
        competentDepartmentID: controls ? [competentDepartmentID] : competentDepartmentID,
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
