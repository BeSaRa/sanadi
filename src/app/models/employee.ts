import { JobTitle } from './job-title';
import { AdminResult } from './admin-result';
import { Cloneable } from "@app/models/cloneable";
import { IMyDateModel } from "angular-mydatepicker";
import { IEmployeeDto } from "@contracts/i-employee-dto";
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';
import { IdentificationType } from '@app/enums/identification-type.enum';
export class Employee extends Cloneable<Employee> implements IEmployeeDto,IAuditModelProperties<Employee> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  id!: number | null;
  arabicName!: string;
  englishName!: string;
  jobTitleId!: number;
  identificationType!: number;
  identificationNumber!: string;
  itemId!: string;
  passportNumber!: string;
  gender!: number;
  nationality!: number;
  phone!: string;
  department!: string;
  contractLocation!: string;
  contractLocationType!: number;
  officeId!: number;
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
  jobTitleInfo!: AdminResult | JobTitle | undefined;
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
  constructor() {
    super();
  }
  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName:{langKey: 'arabic_name', value: this.arabicName},
      englishName:{langKey: 'english_name', value: this.englishName},
      jobTitleId:{langKey: 'job_title', value: this.jobTitleId},
      identificationType:{langKey: 'identification_type', value: this.identificationType},
      identificationNumber:{langKey: 'identification_number', value: this.identificationNumber},
      passportNumber:{langKey: 'passport_number', value: this.passportNumber},
      gender:{langKey: 'gender', value: this.gender},
      nationality:{langKey: 'lbl_nationality', value: this.nationality},
      phone:{langKey: 'lbl_phone', value: this.phone},
      department:{langKey: 'department', value: this.department},
      contractLocation:{langKey: 'contract_location', value: this.contractLocation},
      contractLocationType:{langKey: 'contract_location_type', value: this.contractLocationType},
      officeId:{langKey: 'office_name', value: this.officeId},
      contractStatus:{langKey: 'contract_status', value: this.contractStatus},
      contractType:{langKey: 'contract_type', value: this.contractType},
      jobContractType:{langKey: 'job_contract_type', value: this.jobContractType},
      contractExpiryDate:{langKey: 'contract_expiry_date', value: this.contractExpiryDate},
      workStartDate:{langKey: 'work_start_date', value: this.workStartDate},
      workEndDate:{langKey: 'work_end_date', value: this.workEndDate},
      jobNumber:{langKey: 'job_number', value: this.jobNumber},
      expIdPass:{langKey: this.identificationType ===  IdentificationType.Identification ? 'identification_number_exp_date' : 'passport_expiry_date', value: this.expIdPass},
      functionalGroup:{langKey: 'functional_group', value: this.functionalGroup},
    };
  }
   // don't delete (used in case audit history)
   getAdminResultByProperty(property: keyof Employee): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'gender':
        adminResultValue = this.genderInfo;
        break;
      case 'jobTitleId':
        adminResultValue = this.jobTitleInfo as AdminResult;
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
      case 'contractLocationType':
        adminResultValue = this.contractLocationTypeInfo;
        break;
      case 'jobContractType':
        adminResultValue = this.jobContractTypeInfo;
        break;
      case 'contractStatus':
        adminResultValue = this.contractStatusInfo;
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
}
