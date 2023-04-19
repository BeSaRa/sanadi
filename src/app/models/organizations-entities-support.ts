import { OrganizationsEntitiesSupportInterceptor } from './../model-interceptors/organizations-entities-support-interceptor';
import { AdminResult } from './admin-result';
import { CaseTypes } from '@app/enums/case-types.enum';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { FactoryService } from '@app/services/factory.service';
import { OrganizationsEntitiesSupportService } from '@app/services/organizations-entities-support.service';
import { ControlValueLabelLangKey, ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from './../validators/custom-validators';
import { LicenseApprovalModel } from './license-approval-model';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { ObjectUtils } from '@app/helpers/object-utils';

const { send, receive } = new OrganizationsEntitiesSupportInterceptor();

@InterceptModel({ send, receive })
export class OrganizationsEntitiesSupport extends LicenseApprovalModel<
  OrganizationsEntitiesSupportService,
  OrganizationsEntitiesSupport
> {
  caseType: number = CaseTypes.ORGANIZATION_ENTITIES_SUPPORT;
  serviceType!: 1;
  organizationId!: number;
  subject!: string;
  goal!: string;
  beneficiaries!: string;
  beneficiariesNumber!: number;
  arName!: string;
  enName!: string;
  email!: string;
  jobTitle!: string;
  mobileNo!: string;
  phone!: string;
  description!: string;

  ouInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  serviceTypeInfo!: AdminResult;
  licenseStatusInfo!: AdminResult;
  otherService!: string;

  service: OrganizationsEntitiesSupportService;
  searchFields: ISearchFieldsMap<OrganizationsEntitiesSupport> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields([
      'ouInfo',
      'requestTypeInfo',
      'caseStatusInfo',
      'creatorInfo',
    ]),
    ...normalSearchFields(['fullSerial', 'subject']),
  };

  constructor() {
    super();
    this.service = FactoryService.getService(
      'OrganizationsEntitiesSupportService'
    );
    this.finalizeSearchFields();
  }

  finalizeSearchFields(): void {
    if (this.employeeService.isExternalUser()) {
      delete this.searchFields.ouInfo;
      delete this.searchFields.organizationId;
      delete this.searchFields.organization;
    }
  }
  getOrganizationOfficerValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arName: { langKey: 'arabic_name', value: this.arName },
      enName: { langKey: 'english_name', value: this.enName },
      email: { langKey: 'lbl_email', value: this.email },
      jobTitle: { langKey: 'job_title', value: this.jobTitle },
      mobileNo: { langKey: 'lbl_mobile_number', value: this.mobileNo },
      phone: { langKey: 'lbl_phone', value: this.phone },
    }
  }
  getBeneficiariesTypeValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      beneficiaries: {
        langKey: 'beneficiaries_description',
        value: this.beneficiaries,
      },
      beneficiariesNumber: {
        langKey: 'number_of_beneficiaries',
        value: this.beneficiariesNumber,
      },
    }
  }
  getBasicInfoValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      requestType: { langKey: 'request_type', value: this.requestType },
      serviceType: { langKey: 'service_type', value: this.serviceType },
      organizationId: { langKey: 'organization', value: this.organizationId },
      subject: { langKey: 'subject', value: this.subject },
      goal: { langKey: 'goal', value: this.goal },
      description: { langKey: 'special_explanations', value: this.description },
      otherService: { langKey: 'lbl_other', value: this.otherService },
    };
  }

  getBasicInfoFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<OrganizationsEntitiesSupport>(
      this.getBasicInfoValuesWithLabels()
    );

    return {
      organizationId: control
        ? [values.organizationId, [CustomValidators.required]]
        : values.organizationId,
      serviceType: control
        ? [values.serviceType, [CustomValidators.required]]
        : values.serviceType,
      requestType: control
        ? [values.requestType, [CustomValidators.required]]
        : values.requestType,
      oldLicenseFullSerial: control
        ? [values.oldLicenseFullSerial, [CustomValidators.maxLength(250)]]
        : values.oldLicenseFullSerial,
      oldLicenseId: control ? [values.oldLicenseId] : values.oldLicenseId,
      oldLicenseSerial: control
        ? [values.oldLicenseSerial]
        : values.oldLicenseSerial,
      subject: control
        ? [
            values.subject,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : values.subject,
      goal: control
        ? [
            values.goal,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : values.goal,
      otherService: control
        ? [
            values.otherService,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : values.otherService,
    };
  }
  getBeneficiariesTypeFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<OrganizationsEntitiesSupport>(
      this.getBeneficiariesTypeValuesWithLabels()
    );


    return {
      beneficiaries: control
        ? [
           values.beneficiaries,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : values.beneficiaries,
      beneficiariesNumber: control
        ? [
           values. beneficiariesNumber,
            [
              CustomValidators.required,
              CustomValidators.number,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
              ),
            ],
          ]
        : values.beneficiariesNumber,
    };
  }

  getOrganizationOfficerFields(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<OrganizationsEntitiesSupport>(
      this.getOrganizationOfficerValuesWithLabels()
    );

    return {
      arName: control ? [values.arName, [CustomValidators.required]] :values. arName,
      enName: control ? [values.enName, [CustomValidators.required]] :values. enName,
      email: control
        ? [values.
            email,
            [CustomValidators.required,CustomValidators.pattern('EMAIL')],
          ]
        : values.email,
      jobTitle: control ? [values.jobTitle, [CustomValidators.required]] :values. jobTitle,
      mobileNo: control ? [values.mobileNo, [CustomValidators.number]] :values. mobileNo,
      phone: control ? [values.phone, [CustomValidators.required]] :values. phone,
    };
  }
  buildApprovalForm(control: boolean = false): any {
    const { followUpDate } = this;
    return {
      followUpDate: control
        ? [followUpDate, [CustomValidators.required]]
        : followUpDate,
    };
  }
  approve(): DialogRef {
    return this.service.approve(this, WFResponseType.APPROVE);
  }
  finalApprove(): DialogRef {
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE);
  }
  convertToOrganizationsEntitiesSupport() {
    return new OrganizationsEntitiesSupport().clone({
      caseType: CaseTypes.ORGANIZATION_ENTITIES_SUPPORT,
      organizationId: this.organizationId,
      requestType: this.requestType,
      subject: this.subject,
      goal: this.goal,
      beneficiaries: this.beneficiaries,
      beneficiariesNumber: this.beneficiariesNumber,
      arName: this.arName,
      enName: this.enName,
      email: this.email,
      jobTitle: this.jobTitle,
      mobileNo: this.mobileNo,
      phone: this.phone,
      description: this.description,
    });
  }
  getAdminResultByProperty(property: keyof OrganizationsEntitiesSupport): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'requestType':
        adminResultValue = this.requestTypeInfo;
        break;
      case 'organizationId':
        adminResultValue = this.ouInfo;
        break;
      case 'serviceType':
        adminResultValue = this.serviceTypeInfo;
        break;
      case 'caseStatus':
        adminResultValue = this.caseStatusInfo;
        break;

      default:
        adminResultValue = AdminResult.createInstance({arName: this[property] as string, enName: this[property] as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
