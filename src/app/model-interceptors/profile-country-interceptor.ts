import { ProfileCountry } from '@app/models/profile-country';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@app/helpers/utils';

export class ProfileCountryInterceptor implements IModelInterceptor<ProfileCountry> {
  receive(model: ProfileCountry): ProfileCountry {

    model.countryInfo = AdminResult.createInstance(isValidAdminResult(model.countryInfo) ? model.countryInfo : {});

    return model;
  }

  send(model: Partial<ProfileCountry>): Partial<ProfileCountry> {
    ProfileCountryInterceptor._deleteBeforeSend(model);

    return model;
  }

  private static _deleteBeforeSend(model: Partial<ProfileCountry>): void {
    delete model.countryInfo;
  }

}
