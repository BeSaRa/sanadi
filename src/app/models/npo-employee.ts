import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { AdminResult } from './admin-result';
import { NpoEmployeeInterceptor } from '@app/model-interceptors/npo-employee-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { BankAccountExecutiveManagement } from "@models/bank-account-executive-management";
import { IMyDateModel } from 'angular-mydatepicker';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { NpoEmployeeService } from '@app/services/npo-employee.service';
import { BaseModel } from './base-model';
import { CustomValidators } from '@app/validators/custom-validators';

const { receive, send } = new NpoEmployeeInterceptor();

@InterceptModel({
  receive,
  send
})
export class NpoEmployee extends BaseModel<NpoEmployee, NpoEmployeeService> {
  service!: NpoEmployeeService;
  langService: LangService;
  id!: number;
  qId!: string;
  orgId!: number;

  arabicName!: string;
  englishName!: string;
  email!: string;
  phone!: string;
  jobTitle!: string;
  identificationNumber!: string;
  passportNumber!: string;
  jobNumber!: string;
  department!: string;

  contractLocation!: number;
  status!: number;
  nationality!: number;
  country!: number;
  identificationType!: number;
  gender!: number;
  contractLocationType!: number;
  officeId!: string;
  charityId!: number;
  contractType!: number;
  jobContractType!: number;
  contractStatus!: number;
  functionalGroup!: number;

  workStartDate!: string | IMyDateModel;
  contractExpiryDate!: string | IMyDateModel;
  expIdPass!: string | IMyDateModel;
  workEndDate!: string | IMyDateModel;
  statusDateModified!: string;

  officeInfo!: AdminResult
  orgUnitInfo!: AdminResult
  qInfo!: AdminResult
  jobContractTypeInfo!: AdminResult
  countryInfo!: AdminResult
  functionalGroupInfo!: AdminResult
  contractLocationTypeInfo!: AdminResult
  contractStatusInfo!: AdminResult
  contractTypeInfo!: AdminResult
  contractLocationInfo!: AdminResult;
  statusInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  identificationTypeInfo!: AdminResult;
  genderInfo!: AdminResult;

  constructor() {
    super();
    this.service = FactoryService.getService('NpoEmployeeService')
    this.langService = FactoryService.getService('LangService');
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }
  getName(): string {
    return this.langService?.map.lang == 'ar' ? this.arabicName : this.englishName;
  }

  buildForm(controls?: boolean): any {
    const {
      arabicName,
      englishName,
      jobTitle,
      identificationType,
      qId,
      passportNumber,
      gender,
      nationality,
      phone,
      email,
      department,
      contractLocation,
      contractLocationType,
      officeId,
      charityId,
      contractStatus,
      contractType,
      jobContractType,
      contractExpiryDate,
      workStartDate,
      workEndDate,
      jobNumber,
      expIdPass,
      functionalGroup,
    } = this;
    return {
      arabicName: controls ? [arabicName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arabicName,
      englishName: controls ? [englishName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : englishName,
      jobTitle: controls ? [jobTitle, [CustomValidators.required, CustomValidators.maxLength(150)]] : jobTitle,
      identificationType: controls ? [identificationType, CustomValidators.required] : identificationType,
      qId: controls ? [qId, CustomValidators.maxLength(50)] : qId,
      passportNumber: controls ? [passportNumber] : passportNumber,
      gender: controls ? [gender, CustomValidators.required] : gender,
      nationality: controls ? [nationality, CustomValidators.required] : nationality,
      phone: controls ? [phone, [CustomValidators.number].concat(CustomValidators.commonValidations.phone)] : phone,
      email: controls ? [email, [CustomValidators.required].concat(CustomValidators.commonValidations.email)] : email,
      department: controls ? [department, [ CustomValidators.maxLength(300)]] : department,
      contractLocation: controls ? [contractLocation] : contractLocation,
      contractLocationType: controls ? [contractLocationType, CustomValidators.required] : contractLocationType,
      officeId: controls ? [officeId] : officeId,
      charityId: controls ? [charityId] : charityId,
      contractStatus: controls ? [contractStatus, CustomValidators.required] : contractStatus,
      contractType: controls ? [contractType] : contractType,
      jobContractType: controls ? [jobContractType] : jobContractType,
      contractExpiryDate: controls ? [contractExpiryDate] : contractExpiryDate,
      workStartDate: controls ? [workStartDate, CustomValidators.required] : workStartDate,
      workEndDate: controls ? [workEndDate] : workEndDate,
      expIdPass: controls ? [expIdPass, CustomValidators.required] : expIdPass,
      functionalGroup: controls ? [functionalGroup, CustomValidators.required] : functionalGroup,
      jobNumber: controls ? [jobNumber, CustomValidators.maxLength(50)] : jobNumber,
    }
  }

  convertToBankAccountExecutiveManagement(): BankAccountExecutiveManagement {
    return new BankAccountExecutiveManagement().clone({
      id: this.id,
      arabicName: this.arabicName,
      englishName: this.englishName,
      identificationNumber: (this.identificationNumber ?? '') + '',
      jobTitle: this.jobTitle
    })
  }
}
