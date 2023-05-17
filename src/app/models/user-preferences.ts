import {UserPreferencesService} from '@services/user-preferences.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {UserPreferencesInterceptor} from '@model-interceptors/user-preferences-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {Observable} from 'rxjs';
import {Cloneable} from '@models/cloneable';
import { IMyDateModel } from 'angular-mydatepicker';
import { IHasVacation } from '@app/interfaces/i-has-vacation';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { InternalUser } from './internal-user';
import { ExternalUser } from './external-user';

const interceptor: UserPreferencesInterceptor = new UserPreferencesInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class UserPreferences extends Cloneable<UserPreferences> implements IHasVacation {
  alternateEmailList!: string;
  isMailNotificationEnabled!: boolean;
  defaultLang!: number;
  vacationFrom!:string|null;
  vacationTo!:string|null;

  // extra properties
  alternateEmailListParsed: string[] = [];
  service: UserPreferencesService;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('UserPreferencesService');
  }

  buildForm(controls?: boolean): any {
    const {
      isMailNotificationEnabled,
      defaultLang,
    } = this;
    return {
      isMailNotificationEnabled: controls ? [isMailNotificationEnabled] : isMailNotificationEnabled,
      defaultLang: controls ? [defaultLang, CustomValidators.required] : defaultLang,

    }
  }
  buildVacationForm(controls?: boolean): any {
    const {
      vacationFrom,
      vacationTo
    } = this;
    return {
      vacationFrom: controls ? [vacationFrom] : vacationFrom,
      vacationTo: controls ? [vacationTo] : vacationTo,
    }
  }

  updateUserPreferences(generalUserId: number): Observable<UserPreferences> {
    return this.service.updateUserPreferences(generalUserId, this);
  }
  updateUserVacation(generalUserId: number): Observable<UserPreferences|null> {
    return this.service.updateUserVacation(generalUserId, this);
  }
  openVacationDialog(user: InternalUser | ExternalUser,  canEditPreferences: boolean): Observable<DialogRef> {
    return this.service.openVacationDialog(user,this,canEditPreferences);
  }
}
