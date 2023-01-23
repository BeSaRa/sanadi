import {BaseModel} from '@models/base-model';
import {UserPreferencesService} from '@services/user-preferences.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {UserPreferencesInterceptor} from '@model-interceptors/user-preferences-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';

const interceptor: UserPreferencesInterceptor = new UserPreferencesInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class UserPreferences extends BaseModel<UserPreferences, UserPreferencesService> {
  empNum!: string;
  qid!: string;
  phoneNumber!: string;
  email!: string;
  alternateEmailList!: string;
  isMailNotificationEnabled!: boolean;
  defaultLang!: number;

  service: UserPreferencesService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('UserPreferencesService');
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      empNum,
      qid,
      phoneNumber,
      email,
      isMailNotificationEnabled,
      defaultLang
    } = this;
    return {
      arName: controls ? [{value: arName, disabled: true}, [
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [{value: enName, disabled: true}, [
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      empNum: controls ? [{value: empNum, disabled: true}, [CustomValidators.number, CustomValidators.maxLength(10)]] : empNum,
      qid: controls ? [{value: qid, disabled: true}, [...CustomValidators.commonValidations.qId]] : qid,
      phoneNumber: controls ? [{value: phoneNumber, disabled: true}, CustomValidators.commonValidations.phone] : phoneNumber,
      email: controls ? [{value: email, disabled: true}, [CustomValidators.maxLength(50), CustomValidators.pattern('EMAIL')]] : email,
      isMailNotificationEnabled: controls ? [isMailNotificationEnabled] : isMailNotificationEnabled,
      defaultLang: controls ? [defaultLang, CustomValidators.required] : defaultLang
    }
  }

  updateUserPreferences(generalUserId: number): Observable<UserPreferences> {
    return this.service.updateUserPreferences(generalUserId, this);
  }
}
