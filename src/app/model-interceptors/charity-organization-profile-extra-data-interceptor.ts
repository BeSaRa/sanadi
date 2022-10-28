import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {CharityOrganizationProfileExtraData} from '@app/models/charity-organization-profile-extra-data';

export class CharityOrganizationProfileExtraDataInterceptor implements IModelInterceptor<CharityOrganizationProfileExtraData>{
    caseInterceptor?: IModelInterceptor<CharityOrganizationProfileExtraData> | undefined;
    send(model: Partial<CharityOrganizationProfileExtraData>): Partial<CharityOrganizationProfileExtraData> {
        return model;
    }
    receive(model: CharityOrganizationProfileExtraData): CharityOrganizationProfileExtraData {
        return  model;
    }
}
