import {BaseModel} from '@models/base-model';
import {GlobalSettingsService} from '@services/global-settings.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {InterceptModel} from '@decorators/intercept-model';
import {GlobalSettingsInterceptor} from '@model-interceptors/global-settings-interceptor';
import {CustomValidators} from '@app/validators/custom-validators';
import { Validators } from '@angular/forms';

const interceptor: GlobalSettingsInterceptor = new GlobalSettingsInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class GlobalSettings extends BaseModel<GlobalSettings, GlobalSettingsService> {
  systemArabicName!: string;
  systemEnglishName!: string;
  sessionTimeout!: number;
  fileSize!: number;
  fileType!: string;
  fileTypeArr: number[] = [];
  inboxRefreshInterval!: number;
  supportEmailList!: string;
  enableMailNotification!: boolean;
  enableSMSNotification!: boolean;
  maxDeductionRatio!:number;

  service: GlobalSettingsService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('GlobalSettingsService');
  }

  buildForm(controls?: boolean): any {
    const {
      systemArabicName,
      systemEnglishName,
      sessionTimeout,
      fileSize,
      inboxRefreshInterval,
      fileTypeArr,
      enableMailNotification,
      enableSMSNotification,
      maxDeductionRatio
    } = this;
    return {
      systemArabicName: controls ? [systemArabicName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : systemArabicName,
      systemEnglishName: controls ? [systemEnglishName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : systemEnglishName,
      sessionTimeout: controls ? [sessionTimeout, [
        CustomValidators.required,
        CustomValidators.maxLength(9),
        CustomValidators.number,
        Validators.max(300),
        Validators.min(1)
      ]] : sessionTimeout,
      fileSize: controls ? [fileSize, [
        CustomValidators.required,
        CustomValidators.maxLength(9),
        CustomValidators.number,
        Validators.max(30),
        Validators.min(5)
      ]] : fileSize,
      inboxRefreshInterval: controls ? [inboxRefreshInterval, [
        CustomValidators.required,
        CustomValidators.maxLength(9),
        CustomValidators.number,
        Validators.max(30),
        Validators.min(5)
      ]] : inboxRefreshInterval,
      fileTypeArr: controls ? [fileTypeArr, [
        CustomValidators.requiredArray
      ]] : fileTypeArr,
      enableMailNotification: controls ? [enableMailNotification] : enableMailNotification,
      enableSMSNotification: controls ? [enableSMSNotification] : enableSMSNotification,
      maxDeductionRatio: controls ? [maxDeductionRatio, [
        CustomValidators.required,
        CustomValidators.number,
        Validators.max(100),
        Validators.min(1)
      ]] : maxDeductionRatio,
    }
  }
}
