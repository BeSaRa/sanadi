import { AdminResult } from './admin-result';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { ControlValueLabelLangKey, ISearchFieldsMap } from './../types/types';
import { HasLicenseDurationType } from '@contracts/has-license-duration-type';
import { CaseTypes } from '@app/enums/case-types.enum';
import { mixinLicenseDurationType } from "@app/mixins/mixin-license-duration";
import { Validators } from "@angular/forms";
import { FactoryService } from "@services/factory.service";
import { InterceptModel } from "@decorators/intercept-model";
import { CaseModel } from "@app/models/case-model";
import { HasRequestType } from "@app/interfaces/has-request-type";
import { mixinRequestType } from "@app/mixins/mixin-request-type";
import { CaseModelContract } from "@contracts/case-model-contract";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { CommonUtils } from '@app/helpers/common-utils';
import { ProjectCompletionInterceptor } from '@app/model-interceptors/project-completion-interceptor';
import { ProjectCompletionService } from '@app/services/project-completion.service';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const interceptor = new ProjectCompletionInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive,
})
export class ProjectCompletion
  extends _RequestType<ProjectCompletionService, ProjectCompletion>
  implements HasRequestType, HasLicenseDurationType, CaseModelContract<ProjectCompletionService, ProjectCompletion>, IAuditModelProperties<ProjectCompletion> {
  service!: ProjectCompletionService;
  caseType: number = CaseTypes.PROJECT_COMPLETION;
  requestType!: number;

  description!: string;

  searchFields: ISearchFieldsMap<ProjectCompletion> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['caseStatusInfo', 'creatorInfo', 'ouInfo']),
    ...normalSearchFields(['fullSerial'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService("ProjectCompletionService");
    this.finalizeSearchFields();
  }

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getAdminResultByProperty(property: keyof ProjectCompletion): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
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

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }

  getBasicInfoFormValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType }
    };
  }

  getSpecialExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: { langKey: 'special_explanations', value: this.description },
    }
  }

  formBuilder(controls?: boolean) {
    const basicInfoValues = ObjectUtils.getControlValues<ProjectCompletion>(this.getBasicInfoFormValuesWithLabels());
    const specialExplanationValues = ObjectUtils.getControlValues<ProjectCompletion>(this.getSpecialExplanationValuesWithLabels());

    return {
      basicInfo: {
        requestType: controls ? [basicInfoValues.requestType, Validators.required] : basicInfoValues.requestType,
      },
      explanation: {
        description: controls ? [specialExplanationValues.description, Validators.required] : specialExplanationValues.description,
      }
    };
  }

  // buildApprovalForm(control: boolean = false): any {
  //   const {
  //     followUpDate
  //   } = this;
  //   return {
  //     followUpDate: control ? [followUpDate, [CustomValidators.required]] : followUpDate
  //   }
  // }

}
