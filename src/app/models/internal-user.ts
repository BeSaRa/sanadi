import {BaseModel} from './base-model';
import {UserTypes} from '../enums/user-types.enum';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {AdminResult} from "@app/models/admin-result";
import {InternalDepartment} from "@app/models/internal-department";
import {InternalUserService} from "@app/services/internal-user.service";
import {CustomValidators} from "@app/validators/custom-validators";

export class InternalUser extends BaseModel<InternalUser, InternalUserService> {
  service: InternalUserService;
  id!: number;
  arName!: string;
  enName!: string;
  defaultDepartmentId!: number;
  defaultDepartmentInfo!: AdminResult;
  departmentInfo!: InternalDepartment[];
  domainName!: string;
  email!: string;
  empNum!: string;
  jobTitle!: number;
  jobTitleInfo!: AdminResult;
  officialPhoneNumber!: string;
  phoneExtension!: string;
  phoneNumber!: string;
  status!: number;
  statusInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  statusDateModified!: string;
  userType!: UserTypes;
  generalUserId!: number
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('InternalUserService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }


  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      domainName,
      email,
      empNum,
      jobTitle,
      officialPhoneNumber,
      phoneNumber,
      status,
      phoneExtension,
      defaultDepartmentId
    } = this;
    return {
      arName: controls ? [arName, [CustomValidators.required]] : arName,
      enName: controls ? [enName, [CustomValidators.required]] : enName,
      domainName: controls ? [domainName, [CustomValidators.required]] : domainName,
      email: controls ? [email, [CustomValidators.required]] : email,
      empNum: controls ? [empNum, [CustomValidators.required]] : empNum,
      jobTitle: controls ? [jobTitle, [CustomValidators.required]] : jobTitle,
      officialPhoneNumber: controls ? [officialPhoneNumber, [CustomValidators.required]] : officialPhoneNumber,
      phoneNumber: controls ? [phoneNumber, [CustomValidators.required]] : phoneNumber,
      status: controls ? [status, [CustomValidators.required]] : status,
      phoneExtension: controls ? [phoneExtension, [CustomValidators.required]] : phoneExtension,
      defaultDepartmentId: controls ? [defaultDepartmentId, [CustomValidators.required]] : defaultDepartmentId,
    }
  }
}
