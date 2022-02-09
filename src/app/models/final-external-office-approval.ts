import {FinalExternalOfficeApprovalService} from '../services/final-external-office-approval.service';
import {FactoryService} from '../services/factory.service';
import {BankAccount} from './bank-account';
import {BankBranch} from './bank-branch';
import {ExecutiveManagement} from './executive-management';
import {CaseModel} from './case-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {CommonUtils} from '@app/helpers/common-utils';
import {LicenseApprovalModel} from '@app/models/license-approval-model';
import {DateUtils} from '@app/helpers/date-utils';
import {AdminResult} from '@app/models/admin-result';
import {CaseTypes} from '@app/enums/case-types.enum';

export class FinalExternalOfficeApproval extends LicenseApprovalModel<FinalExternalOfficeApprovalService, FinalExternalOfficeApproval> {
  caseType: number = CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL;
  requestType!: number;
  organizationId!: number;
  subject: string = '';
  actionType!: number;
  country!: number;
  region!: string;
  description: string = '';
  specialistJustification: string = '';
  chiefJustification: string = '';
  managerJustification: string = '';
  reviewerDepartmentJustification: string = '';
  specialistDecision?: number;
  chiefDecision?: number;
  managerDecision?: number;
  reviewerDepartmentDecision?: number;
  establishmentDate: string = '';
  address: string = '';
  email: string = '';
  externalOfficeName: string = '';
  fax: string = '';
  phone: string = '';
  postalCode: string = '';
  recordNo: string = '';

  executiveManagementList: ExecutiveManagement[] = [];
  branchList: BankBranch[] = [];
  bankAccountList: BankAccount[] = [];

  specialistDecisionInfo!: AdminResult;
  chiefDecisionInfo!: AdminResult;
  managerDecisionInfo!: AdminResult;
  generalManagerDecisionInfo!: AdminResult;
  reviewerDepartmentDecisionInfo!: AdminResult;
  initialLicenseFullserial!: string;
  initialLicenseId!: string;
  initialLicenseSerial!: number;
  licenseStatusInfo!: AdminResult;

  service: FinalExternalOfficeApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('FinalExternalOfficeApprovalService');
  }

  getFormFields(control: boolean = false): any {
    const {
      requestType,
      initialLicenseId,
      initialLicenseFullserial,
      initialLicenseSerial,
      // licenseNumber,
      oldLicenseFullserial,
      oldLicenseId,
      oldLicenseSerial,
      country,
      region,
      externalOfficeName,
      establishmentDate,
      recordNo,
      address,
      phone,
      fax,
      postalCode,
      email,
      description
    } = this;

    return {
      requestType: control ? [requestType, [CustomValidators.required]] : requestType,
      initialLicenseFullserial: control ? [initialLicenseFullserial, [CustomValidators.maxLength(250)]] : initialLicenseFullserial,
      initialLicenseId: control ? [initialLicenseId] : initialLicenseId,
      initialLicenseSerial: control ? [initialLicenseSerial] : initialLicenseSerial,
      // licenseNumber: control ? [licenseNumber] : licenseNumber,
      oldLicenseFullserial: control ? [oldLicenseFullserial, [CustomValidators.maxLength(250)]] : oldLicenseFullserial,
      oldLicenseId: control ? [oldLicenseId] : oldLicenseId,
      oldLicenseSerial: control ? [oldLicenseSerial] : oldLicenseSerial,
      country: control ? [country, [CustomValidators.required]] : country,
      region: control ? [region, [CustomValidators.required, CustomValidators.maxLength(50)]] : region,//state
      externalOfficeName: control ? [externalOfficeName, [CustomValidators.required, CustomValidators.maxLength(100)]] : externalOfficeName,
      establishmentDate: control ? [DateUtils.changeDateToDatepicker(establishmentDate), [CustomValidators.required, CustomValidators.maxDate(new Date())]] : DateUtils.changeDateToDatepicker(establishmentDate),
      recordNo: control ? [recordNo, [CustomValidators.required, CustomValidators.maxLength(20)]] : recordNo,
      address: control ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : postalCode,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(100)]] : email,
      description: control ? [description, [CustomValidators.required, CustomValidators.maxLength(1200)]] : description
    }
  }
}
