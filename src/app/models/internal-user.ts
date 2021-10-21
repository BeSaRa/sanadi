import {BaseModel} from './base-model';
import {UserTypes} from '../enums/user-types.enum';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {AdminResult} from "@app/models/admin-result";
import {InternalDepartment} from "@app/models/internal-department";
import {InternalUserService} from "@app/services/internal-user.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {Validators} from "@angular/forms";

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
  generalUserId!: number;
  customRoleId!: number;
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
      defaultDepartmentId,
      customRoleId
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      domainName: controls ? [domainName, [CustomValidators.required]] : domainName,
      email: controls ? [email, [CustomValidators.required]] : email,
      empNum: controls ? [empNum, [
        CustomValidators.required,
        CustomValidators.number,
        CustomValidators.maxLength(10)
      ]] : empNum,
      jobTitle: controls ? [jobTitle, [CustomValidators.required]] : jobTitle,
      officialPhoneNumber: controls ? [officialPhoneNumber, [
        CustomValidators.number,
        Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)
      ]] : officialPhoneNumber,
      phoneNumber: controls ? [phoneNumber, [
        CustomValidators.required, CustomValidators.number,
        CustomValidators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)
      ]] : phoneNumber,
      status: controls ? [status, [CustomValidators.required]] : status,
      phoneExtension: controls ? [phoneExtension, [
        CustomValidators.number,
        CustomValidators.maxLength(10)
      ]] : phoneExtension,
      defaultDepartmentId: controls ? [defaultDepartmentId, [CustomValidators.required]] : defaultDepartmentId,
      customRoleId: controls ? [customRoleId] : customRoleId
    }
  }
}
