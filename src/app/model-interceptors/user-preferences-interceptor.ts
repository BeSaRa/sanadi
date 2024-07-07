import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UserPreferences} from '@models/user-preferences';
import {CommonUtils} from '@helpers/common-utils';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';
import { DateUtils } from '@app/helpers/date-utils';

export class UserPreferencesInterceptor implements IModelInterceptor<UserPreferences> {
  send(model: Partial<UserPreferences>): Partial<UserPreferences> {
    model.vacationFrom =!model.vacationFrom
    ? undefined
    : DateUtils.changeDateFromDatepicker(
        model.vacationFrom as unknown as IMyDateModel
      )?.toISOString();
    model.vacationTo =!model.vacationTo
    ? undefined
    : DateUtils.changeDateFromDatepicker(
        model.vacationTo as unknown as IMyDateModel
      )?.toISOString();
     UserPreferencesInterceptor.stringifyEmailList(model);

    UserPreferencesInterceptor._deleteBeforeSend(model)
    return model;
  }

  receive(model: UserPreferences): UserPreferences {
    UserPreferencesInterceptor.parseEmailsList(model);
    model.vacationFrom =DateUtils.getDateStringFromDate(model.vacationFrom);
    model.vacationTo =DateUtils.getDateStringFromDate(model.vacationTo);
    return model;
  }

  private static parseEmailsList(model: UserPreferences) {
    try {
      model.alternateEmailListParsed = JSON.parse(model.alternateEmailList);
    } catch (e) {
      model.alternateEmailListParsed = [];
    }
  }

  private static stringifyEmailList(model: Partial<UserPreferences>) {
    model.alternateEmailList = JSON.stringify((model.alternateEmailListParsed ?? []).filter((email) => CommonUtils.isValidValue(email)));
  }

  private static _deleteBeforeSend(model: Partial<UserPreferences>): void {
    delete model.langService;
    delete model.service;
    delete model.alternateEmailListParsed;
  }
}
