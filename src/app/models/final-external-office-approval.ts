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

export class FinalExternalOfficeApproval extends LicenseApprovalModel<FinalExternalOfficeApprovalService, FinalExternalOfficeApproval> {
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
  establishmentDate: string = '';
  address: string = '';
  email: string = '';
  externalOfficeName: string = '';
  fax: string = '';
  initialLicenseNumber: string = '';
  phone: string = '';
  postalCode: string = '';
  recordNo: string = '';

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
      country: control ? [country, [CustomValidators.required]] : country,
      region: control ? [region, [CustomValidators.required]] : region,//state
      externalOfficeName: control ? [externalOfficeName, [CustomValidators.required]] : externalOfficeName,
      establishmentDate: control ? [DateUtils.changeDateToDatepicker(establishmentDate), [CustomValidators.required, CustomValidators.maxDate(new Date())]] : DateUtils.changeDateToDatepicker(establishmentDate),
      recordNo: control ? [recordNo, [CustomValidators.required, CustomValidators.maxLength(20)]] : recordNo,
      address: control ? [address, [CustomValidators.required, CustomValidators.maxLength(100)]] : address,
      phone: control ? [phone, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : phone,
      fax: control ? [fax, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)] : fax,
      postalCode: control ? [postalCode, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : postalCode,
      email: control ? [email, [CustomValidators.required, CustomValidators.pattern('EMAIL')]] : email,
      description: control ? [description, [CustomValidators.required]] : description
    }
  }
}
