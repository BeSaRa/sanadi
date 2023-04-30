import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { CaseTypes } from '@app/enums/case-types.enum';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { HasExternalCooperationAuthority } from '@app/interfaces/has-external-cooperation-authority';
import { HasFollowUpDate } from '@app/interfaces/has-follow-up-date';
import { HasRequestType } from '@app/interfaces/has-request-type';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { mixinLicenseDurationType } from '@app/mixins/mixin-license-duration';
import { mixinRequestType } from '@app/mixins/mixin-request-type';
import { ForeignCountriesProjectsInterceptor } from '@app/model-interceptors/foriegn-countries-projects-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { ForeignCountriesProjectsService } from '@app/services/foreign-countries-projects.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { CaseModel } from './case-model';
import { ProjectNeed, ProjectNeeds } from './project-needs';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ControlValueLabelLangKey } from '@app/types/types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { ObjectUtils } from '@app/helpers/object-utils';

const _RequestType = mixinLicenseDurationType(mixinRequestType(CaseModel));
const { send, receive } = new ForeignCountriesProjectsInterceptor();

@InterceptModel({ send, receive })
export class ForeignCountriesProjects extends _RequestType<ForeignCountriesProjectsService, ForeignCountriesProjects> implements HasRequestType, HasExternalCooperationAuthority, HasFollowUpDate,IAuditModelProperties<ForeignCountriesProjects> {
  public service!: ForeignCountriesProjectsService;
  constructor() {
    super();
    this.service = FactoryService.getService(
      'ForeignCountriesProjectsService'
    );
  }
  requestType!: number;
  caseType: number = CaseTypes.FOREIGN_COUNTRIES_PROJECTS;
  externalCooperationAuthority!: number;
  externalCooperationAuthorityInfo!: AdminResult;
  organizationId!: number;
  country!: number;
  countryInfo!: AdminResult;
  projectNeeds: ProjectNeeds = [];
  projectNeedList: ProjectNeed[] = this.projectNeeds as ProjectNeed[];
  oldLicenseId!: string;
  oldLicenseSerial!: number;
  oldLicenseFullSerial!: string;
  needSubject!: string;
  justification!: string;
  description!: string;
  recommendation!: string;
  subject!: string;

  // for approval popup
  nPOList!: number[];
  followUpDate!: string | IMyDateModel;
  customTerms!: string;
  publicTerms!: string;


  getExternalCooperationAuthority(): number {
    return this.externalCooperationAuthority;
  }

  getRequestType(): number {
    return this.requestType;
  }
  getExplanationValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      description: {langKey: 'special_explanations', value: this.description},
     }
  }
  buildExplanation(controls: boolean = false): any {
    const { description } = ObjectUtils.getControlValues<ForeignCountriesProjects>(this.getExplanationValuesWithLabels());
    ;
    return {
      description: controls ? [description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : description,
    };
  }
  getAdminResultByProperty(property: keyof ForeignCountriesProjects): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;
      case 'country':
        adminResultValue = this.countryInfo;
        break;
      case 'externalCooperationAuthority':
        adminResultValue = this.externalCooperationAuthorityInfo;
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
      oldLicenseFullSerial:{langKey: 'serial_number', value: this.oldLicenseFullSerial},
      externalCooperationAuthority:{langKey: 'external_cooperation_authority', value: this.externalCooperationAuthority},
      organizationId:{langKey: 'lbl_organization', value: this.organizationId},
      country:{langKey: 'country', value: this.country},
      justification:{langKey: 'lbl_justification', value: this.justification},
      recommendation:{langKey: 'recommendation', value: this.recommendation},
      needSubject:{langKey: 'lbl_description', value: this.needSubject}};
  }
  buildForm(withControls: boolean): IKeyValue {
    const {
      requestType, oldLicenseFullSerial,
      externalCooperationAuthority,
      organizationId,
      country,
      justification,
      recommendation,
      needSubject} = ObjectUtils.getControlValues<ForeignCountriesProjects>(this.getBasicInfoValuesWithLabels());


    return {
      oldLicenseFullSerial: withControls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
      organizationId: withControls ? [organizationId, [CustomValidators.required]] : organizationId,
      externalCooperationAuthority: withControls ? [externalCooperationAuthority, [CustomValidators.required]] : externalCooperationAuthority,
      requestType: withControls ? [requestType, [CustomValidators.required]] : requestType,
      country: withControls ? [country, [CustomValidators.required]] : country,
      needSubject: withControls ? [needSubject, [CustomValidators.required, CustomValidators.maxLength(300)]] : needSubject,
      justification: withControls ? [justification, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : justification,
      recommendation: withControls ? [recommendation, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : recommendation
    };
  }

  buildApprovalForm(withControls: boolean = false): any {
    const {
      followUpDate,
      nPOList,
      publicTerms,
      customTerms,
    } = this;
    return {
      followUpDate: withControls ? [followUpDate, [CustomValidators.required]] : followUpDate,
      nPOList: withControls ? [nPOList] : nPOList,
      publicTerms: withControls ? [publicTerms] : publicTerms,
      customTerms: withControls ? [customTerms] : customTerms
    }
  }
  approve(): DialogRef {
    return this.service.finalApproveTask(this, WFResponseType.APPROVE);
  }
  finalApprove(): DialogRef {
    return this.service.finalApproveTask(this, WFResponseType.FINAL_APPROVE);
  }
}
