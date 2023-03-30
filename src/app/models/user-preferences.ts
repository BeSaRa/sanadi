import {UserPreferencesService} from '@services/user-preferences.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {UserPreferencesInterceptor} from '@model-interceptors/user-preferences-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {Cloneable} from '@models/cloneable';

const interceptor: UserPreferencesInterceptor = new UserPreferencesInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class UserPreferences extends Cloneable<UserPreferences> {
  alternateEmailList!: string;
  isMailNotificationEnabled!: boolean;
  defaultLang!: number;

  // extra properties
  alternateEmailListParsed: string[] = [];
  service: UserPreferencesService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('UserPreferencesService');
  }

  buildForm(isLoggedInUserPreferences: boolean, controls?: boolean): any {
    const {
      isMailNotificationEnabled,
      defaultLang
    } = this;
    return {
      isMailNotificationEnabled: controls ? [{
        value: isMailNotificationEnabled,
        disabled: !isLoggedInUserPreferences
      }] : isMailNotificationEnabled,
      defaultLang: controls ? [{
        value: defaultLang,
        disabled: !isLoggedInUserPreferences
      }, CustomValidators.required] : defaultLang
    }
  }

  updateUserPreferences(generalUserId: number): Observable<UserPreferences> {
    return this.service.updateUserPreferences(generalUserId, this);
  }
}
