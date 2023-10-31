import { AdminResult } from './admin-result';
import { Cloneable } from "@app/models/cloneable";
import { IMyDateModel } from "angular-mydatepicker";
import { IEmployeeDto } from "@contracts/i-employee-dto";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';
import { IdentificationType } from '@app/enums/identification-type.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
export class Employee extends Cloneable<Employee> implements IEmployeeDto, IAuditModelProperties<Employee> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  id!: number | null;
  arabicName!: string;
  englishName!: string;
  jobTitle!: string;
  identificationType!: number;
  identificationNumber!: string;
  itemId!: string;
  passportNumber!: string;
  gender!: number;
  nationality!: number;
  phone!: string;
  email!: string;
  department!: string;
  contractLocation!: number;
  contractLocationType!: number;
  officeId!: string;
  charityId!: number;
  contractType!: number;
  jobContractType!: number;
  contractStatus!: number;
  qId!: string;
  updatedBy!: number;
  contractExpiryDate!: string | IMyDateModel;
  workStartDate!: string | IMyDateModel;
  workEndDate!: string | IMyDateModel;
  updatedOn!: string | IMyDateModel;
  expIdPass!: string | IMyDateModel;
  jobNumber!: string;
  functionalGroup!: number;
  contractLocationInfo!: AdminResult;
  officeInfo!: AdminResult;
  functionalGroupInfo!: AdminResult;
  contractStatusInfo!: AdminResult;
  contractTypeInfo!: AdminResult;
  genderInfo!: AdminResult;
  identificationTypeInfo!: AdminResult;
  jobContractTypeInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  orgUnitInfo!: AdminResult;
  statusInfo!: AdminResult;
  countryInfo!: AdminResult;
  contractLocationTypeInfo!: AdminResult;
  qInfo!: AdminResult;
  contractExpiryDateStamp!: number | null;
  workStartDateStamp!: number | null;
  workEndDateStamp!: number | null;
  updatedOnStamp!: number | null;
  expIdPassStamp!: number | null;
  constructor() {
    super();
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: { langKey: 'arabic_name', value: this.arabicName },
      englishName: { langKey: 'english_name', value: this.englishName },
      jobTitle: { langKey: 'job_title', value: this.jobTitle },
      identificationType: { langKey: 'identification_type', value: this.identificationType },
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      passportNumber: { langKey: 'passport_number', value: this.passportNumber },
      gender: { langKey: 'gender', value: this.gender },
      nationality: { langKey: 'lbl_nationality', value: this.nationality },
      phone: { langKey: 'lbl_phone', value: this.phone },
      email: { langKey: 'lbl_email', value: this.email },
      department: { langKey: 'department', value: this.department },
      contractLocation: { langKey: 'contract_location', value: this.contractLocation },
      contractLocationType: { langKey: 'contract_location_type', value: this.contractLocationType },
      officeId: { langKey: 'office_name', value: this.officeId },
      charityId: { langKey: 'office_name', value: this.charityId },
      contractStatus: { langKey: 'contract_status', value: this.contractStatus },
      contractType: { langKey: 'contract_type', value: this.contractType },
      jobContractType: { langKey: 'job_contract_type', value: this.jobContractType },
      contractExpiryDate: { langKey: 'contract_expiry_date', value: this.contractExpiryDate, comparisonValue: this.contractExpiryDateStamp },
      workStartDate: { langKey: 'work_start_date', value: this.workStartDate, comparisonValue: this.workStartDateStamp },
      workEndDate: { langKey: 'work_end_date', value: this.workEndDate, comparisonValue: this.workEndDateStamp },
      updatedOn: { langKey: {} as keyof ILanguageKeys, value: this.updatedOn, comparisonValue: this.updatedOnStamp, skipAuditComparison: true },
      jobNumber: { langKey: 'job_number', value: this.jobNumber },
      expIdPass: { langKey: this.identificationType === IdentificationType.Identification ? 'identification_number_exp_date' : 'passport_expiry_date', value: this.expIdPass, comparisonValue: this.expIdPassStamp },
      functionalGroup: { langKey: 'functional_group', value: this.functionalGroup },
    };
  }
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof Employee): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'gender':
        adminResultValue = this.genderInfo;
        break;
      case 'identificationType':
        adminResultValue = this.identificationTypeInfo;
        break;
      case 'nationality':
        adminResultValue = this.nationalityInfo;
        break;
      case 'contractType':
        adminResultValue = this.contractTypeInfo;
        break;
      case 'contractLocation':
        adminResultValue = this.contractLocationInfo;
        break;
      case 'contractLocationType':
        adminResultValue = this.contractLocationTypeInfo;
        break;
      case 'jobContractType':
        adminResultValue = this.jobContractTypeInfo;
        break;
      case 'contractStatus':
        adminResultValue = this.contractStatusInfo;
        break;
      case 'functionalGroup':
        adminResultValue = this.functionalGroupInfo;
        break;
      case 'officeId':
        adminResultValue = this.officeInfo;
        break;
        // charityId is alias for officeId so it will use same info object
      case 'charityId':
        adminResultValue = this.officeInfo;
        break;

      case 'contractExpiryDate':
        const contractExpiryDateValue = DateUtils.getDateStringFromDate(this.contractExpiryDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: contractExpiryDateValue, enName: contractExpiryDateValue });
        break;
      case 'workStartDate':
        const workStartDateValue = DateUtils.getDateStringFromDate(this.workStartDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: workStartDateValue, enName: workStartDateValue });
        break;
      case 'workEndDate':
        const workEndDateValue = DateUtils.getDateStringFromDate(this.workEndDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: workEndDateValue, enName: workEndDateValue });
        break;
      case 'expIdPass':
        const expIdPassValue = DateUtils.getDateStringFromDate(this.expIdPass, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: expIdPassValue, enName: expIdPassValue });
        break;
      case 'updatedOn':
        const updatedOnValue = DateUtils.getDateStringFromDate(this.updatedOn, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: updatedOnValue, enName: updatedOnValue });
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
}
