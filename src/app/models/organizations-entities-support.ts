import { OrganizationsEntitiesSupportInterceptor } from './../model-interceptors/organizations-entities-support-interceptor';
import { AdminResult } from './admin-result';
import { CaseTypes } from '@app/enums/case-types.enum';
import { dateSearchFields } from '@app/helpers/date-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { FactoryService } from '@app/services/factory.service';
import { OrganizationsEntitiesSupportService } from '@app/services/organizations-entities-support.service';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from './../validators/custom-validators';
import { LicenseApprovalModel } from './license-approval-model';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';

const { send, receive } = new OrganizationsEntitiesSupportInterceptor();

@InterceptModel({ send, receive })
export class OrganizationsEntitiesSupport extends LicenseApprovalModel<
  OrganizationsEntitiesSupportService,
  OrganizationsEntitiesSupport
> {
  caseType: number = CaseTypes.ORGANIZATION_ENTITIES_SUPPORT;
  organizationId!: number;
  serviceType!: 1;
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

  ouInfo!:AdminResult;
  requestTypeInfo!:AdminResult;
  serviceTypeInfo!:AdminResult;
  licenseStatusInfo!: AdminResult;
  otherService!: string;


  service: OrganizationsEntitiesSupportService;
  searchFields: ISearchFieldsMap<OrganizationsEntitiesSupport> = {
    ...dateSearchFields(['createdOn']),
    ...infoSearchFields(['ouInfo', 'requestTypeInfo','caseStatusInfo','creatorInfo']),
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

  getBasicInfoFields(control: boolean = false): any {
    const {
      organizationId,
      serviceType,
      requestType,
      oldLicenseFullSerial,
      oldLicenseId,
      oldLicenseSerial,
      subject,
      goal,
      otherService
    } = this;

    return {
      organizationId: control
        ? [organizationId , [CustomValidators.required]]
        : organizationId,
      serviceType: control
        ? [serviceType, [CustomValidators.required]]
        : serviceType,
      requestType: control
        ? [requestType, [CustomValidators.required]]
        : requestType,
      oldLicenseFullSerial: control
        ? [oldLicenseFullSerial, [CustomValidators.maxLength(250)]]
        : oldLicenseFullSerial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      subject: control
        ? [
            subject,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : subject,
      goal: control
        ? [
            goal,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : goal,
      otherService: control
        ? [
            otherService,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : otherService,
    };
  }
  getBeneficiariesTypeFields(control: boolean = false): any {
    const { beneficiaries, beneficiariesNumber } = this;

    return {
      beneficiaries: control
        ? [
            beneficiaries,
            [
              CustomValidators.required,
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : beneficiaries,
      beneficiariesNumber: control
        ? [
            beneficiariesNumber,
            [CustomValidators.required, CustomValidators.number,CustomValidators.maxLength(
              CustomValidators.defaultLengths.NUMBERS_MAXLENGTH
            )],
          ]
        : beneficiariesNumber,
    };
  }

  getOrganizationOfficerFields(control: boolean = false): any {
    const { arName, enName, email, jobTitle, mobileNo, phone } = this;

    return {
      arName: control ? [arName, [CustomValidators.required]] : arName,
      enName: control ? [enName, [CustomValidators.required]] : enName,
      email: control
        ? [
            email,
            [CustomValidators.required, CustomValidators.pattern('EMAIL')],
          ]
        : email,
      jobTitle: control ? [jobTitle, [CustomValidators.required]] : jobTitle,
      mobileNo: control ? [mobileNo, [CustomValidators.number]] : mobileNo,
      phone: control ? [phone, [CustomValidators.required]] : phone,
    };
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
    return this.service.finalApprove(this, WFResponseType.FINAL_APPROVE)
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
}
