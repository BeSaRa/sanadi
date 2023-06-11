import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '@services/factory.service';
import {ExternalUserService} from '@services/external-user.service';
import {LangService} from '@services/lang.service';
import {INames} from '@contracts/i-names';
import {AdminResult} from './admin-result';
import {ISearchFieldsMap} from '../types/types';
import {DialogRef} from '../shared/models/dialog-ref';
import {ExternalUserInterceptor} from '@app/model-interceptors/external-user-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UserTypes} from '@app/enums/user-types.enum';
import {UserPreferences} from '@models/user-preferences';

const interceptor = new ExternalUserInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class ExternalUser extends BaseModel<ExternalUser, ExternalUserService> {
  serviceToken!: string;
  customRoleId: number | undefined;
  qid: string | undefined;
  profileId!: number;
  domainPwd!: string;
  nationality!: number;
  gender!: number;
  status: number | undefined;
  statusDateModified: number | undefined;
  userType: UserTypes = UserTypes.EXTERNAL;
  phoneNumber: string | undefined;
  officialPhoneNumber: string | undefined;
  email: string | undefined;
  jobTitle: number | undefined;
  jobTitleName!: string;
  empNum: number | undefined;
  phoneExtension: string | undefined;
  domainName!: string;
  generalUserId!: number;
  profileInfo!: AdminResult;
  customRoleInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  statusInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  jobTitleInfo!: AdminResult;
  userPreferences!: UserPreferences;

  service: ExternalUserService;
  private langService: LangService;
  // lookupService: LookupService;
  statusDateModifiedString!: string;

  searchFields: ISearchFieldsMap<ExternalUser> = {
    ...normalSearchFields(['arName', 'enName', 'empNum', 'domainName', 'statusDateModifiedString']),
    ...infoSearchFields(['statusInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ExternalUserService');
    this.langService = FactoryService.getService('LangService');
    // this.lookupService = FactoryService.getService('LookupService');
  }

  create(): Observable<ExternalUser> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<ExternalUser> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<ExternalUser> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getJobTitle(): string {
    return this.jobTitleName;
  }

  /*getStatusLookup(): Lookup | null {
    return this.lookupService.findLookupByLookupKey(this.lookupService.listByCategory.CommonStatus, this.status);
  }*/

  isExternal(): boolean {
    return true;
  }

  isInternal(): boolean {
    return false;
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): Observable<boolean> {
    return this.service.updateStatus(this.id, newStatus);
  }

  getProfileId(): number {
    return this.profileId;
  }

  // noinspection JSUnusedGlobalSymbols
  getUniqueName(): string {
    return this.qid?.toString() ?? '';
  }

  getBasicInfoValuesWithLabels(): { [key: string]: { langKey: keyof ILanguageKeys, value: any } } {
    return {
      arName: {langKey: 'lbl_arabic_name', value: this.arName},
      enName: {langKey: 'lbl_english_name', value: this.enName},
      qid: {langKey: 'lbl_qid', value: this.qid},
      empNum: {langKey: 'lbl_employee_number', value: this.empNum},
      phoneNumber: {langKey: 'lbl_phone', value: this.phoneNumber},
      phoneExtension: {langKey: 'lbl_phone_extension', value: this.phoneExtension},
      officialPhoneNumber: {langKey: 'lbl_official_phone_number', value: this.officialPhoneNumber},
      email: {langKey: 'lbl_email', value: this.email},
      jobTitleName: {langKey: 'lbl_job_title', value: this.jobTitleName},
      status: {langKey: 'lbl_status', value: this.status},
      profileId: {langKey: 'profile', value: this.profileId},
      customRoleId: {langKey: 'lbl_custom_role', value: this.customRoleId},
    };
  }

  getBasicControlKeys(): string[] {
    let keys: string[] = [];
    const valuesWithLabels = this.getBasicInfoValuesWithLabels();
    for (const [controlKey, valueObj] of Object.entries(valuesWithLabels)) {
      keys.push(controlKey);
    }
    return keys;
  }

  getBasicControlValues(): Partial<ExternalUser> {
    let values: Partial<ExternalUser> = {};
    const valuesWithLabels = this.getBasicInfoValuesWithLabels();
    for (const [controlKey, valueObj] of Object.entries(valuesWithLabels)) {
      // @ts-ignore
      values[controlKey] = valueObj.value;
    }
    return values;
  }

  getBasicControlLabels(): { [key: string]: keyof ILanguageKeys } {
    let values: { [key: string]: keyof ILanguageKeys } = {};
    const valuesWithLabels = this.getBasicInfoValuesWithLabels();
    for (const [controlKey, valueObj] of Object.entries(valuesWithLabels)) {
      values[controlKey] = valueObj.langKey;
    }
    return values;
  }

  buildForm(controls?: boolean): any {
    let values = this.getBasicControlValues();
    return {
      arName: controls ? [values.arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]] : values.arName,
      enName: controls ? [values.enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]] : values.enName,
      qid: controls ? [{
        value: values.qid,
        disabled: !!this.id
      }, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : values.qid,
      empNum: controls ? [values.empNum, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]] : values.empNum,
      phoneNumber: controls ? [values.phoneNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.phone)] : values.phoneNumber,
      phoneExtension: controls ? [values.phoneExtension, [CustomValidators.number, Validators.maxLength(10)]] : values.phoneExtension,
      officialPhoneNumber: controls ? [values.officialPhoneNumber, CustomValidators.commonValidations.phone] : values.officialPhoneNumber,
      email: controls ? [values.email, [
        CustomValidators.required, ...CustomValidators.commonValidations.email]] : values.email,
      jobTitleName: controls ? [values.jobTitleName, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.jobTitleName,
      status: controls ? [values.status, CustomValidators.required] : values.status,
      profileId: controls ? [values.profileId, CustomValidators.required] : values.profileId,
      customRoleId: controls ? [values.customRoleId] : values.customRoleId // not required as it is dummy to be tracked from permissions tab
    };
  }

  setBasicFormCrossValidations(): any {
    return CustomValidators.validateFieldsStatus([
      'arName', 'enName', 'empNum', 'qid', 'phoneNumber', 'phoneExtension',
      'officialPhoneNumber', 'email', 'jobTitleName', 'status', 'profileId', 'customRoleId']
    );
  }
}
