import {FinalExternalOfficeApprovalService} from '../services/final-external-office-approval.service';
import {FactoryService} from '../services/factory.service';
import {BankAccount} from './bank-account';
import {BankBranch} from './bank-branch';
import {ExecutiveManagement} from './executive-management';
import {CaseModel} from './case-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {CommonUtils} from '@app/helpers/common-utils';

export class FinalExternalOfficeApproval extends CaseModel<FinalExternalOfficeApprovalService, FinalExternalOfficeApproval> {
  caseType: number = 8;
  requestType!: number;
  organizationId!: number;
  subject: string = '';
  actionType!: number;
  country!: number;
  region!: number;
  description: string = '';
  specialistJustification: string = '';
  chiefJustification: string = '';
  managerJustification: string = '';
  reviewerDepartmentJustification: string = '';
  specialistDecision?: number;
  chiefDecision?: number;
  managerDecision?: number;
  reviewerDepartmentDecision?: number;
  licenseNumber: string = '';
  licenseDuration!: number;
  licenseStatus!: number;
  licenseStartDate: string = '';
  licenseEndDate: string = '';
  licenseApprovedDate: string = '';
  establishmentDate: string = '';
  address: string = '';
  email: string = '';
  externalOfficeName: string = '';
  fax: string = '';
  initialLicenseNumber: string = '';
  phone: string = '';
  postalCode: string = '';
  recordNo: string = '';
  customTerms: string = '';
  publicTerms: string = '';
  executiveManagementList: ExecutiveManagement[] = [];
  branchList: BankBranch[] = [];
  bankAccountList: BankAccount[] = [];

  service: FinalExternalOfficeApprovalService;

  constructor() {
    super();
    this.service = FactoryService.getService('FinalExternalOfficeApprovalService');
  }

  getFormFields(control: boolean = false): any {
    const {
      requestType,
      initialLicenseNumber,
      licenseNumber,
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
      initialLicenseNumber: control ? [{
        value: initialLicenseNumber,
        disabled: !CommonUtils.isValidValue(requestType)
      }] : initialLicenseNumber,
      licenseNumber: control ? [{
        value: licenseNumber,
        disabled: !CommonUtils.isValidValue(requestType)
      }] : licenseNumber,
      country: control ? [country, [CustomValidators.required]] : requestType,
      region: control ? [region, [CustomValidators.required]] : requestType,//state
      externalOfficeName: control ? [externalOfficeName, [CustomValidators.required]] : requestType,
      establishmentDate: control ? [establishmentDate, [CustomValidators.required, CustomValidators.maxDate(new Date())]] : requestType,
      recordNo: control ? [recordNo, [CustomValidators.required, CustomValidators.maxLength(20)]] : requestType,
      address: control ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : requestType,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : requestType,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : requestType,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : requestType,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : requestType,
      description: control ? [description, [CustomValidators.required]] : description
    }
  }
}
