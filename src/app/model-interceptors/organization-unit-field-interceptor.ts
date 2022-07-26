import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { OrganizationUnitField } from '@app/models/organization-unit-field';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class OrganizationUnitFieldInterceptor implements IModelInterceptor<OrganizationUnitField> {
    receive(model: OrganizationUnitField): OrganizationUnitField {
        const lookupService = FactoryService.getService('LookupService') as LookupService;
        model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
        return model;
      }
    
      send(model: Partial<OrganizationUnitField>): Partial<OrganizationUnitField> {
        delete model.statusInfo;
        delete model.service;
        delete model.langService;
        return model;
      }
}
