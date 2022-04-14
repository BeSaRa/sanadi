import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectionApprovalSearchCriteria} from '@app/models/collection-approval-search-criteria';
import {CollectionItem} from '@app/models/collection-item';

export class CollectionApprovalSearchCriteriaInterceptor implements IModelInterceptor<CollectionApprovalSearchCriteria> {
  receive(model: CollectionApprovalSearchCriteria): CollectionApprovalSearchCriteria {
    return model;
  }

  send(model: Partial<CollectionApprovalSearchCriteria>): Partial<CollectionApprovalSearchCriteria> {
    if (model.exportedLicenseFullSerial) {
      model.collectionItemList = [{exportedLicenseFullSerial: model.exportedLicenseFullSerial}] as CollectionItem[];
    }
    delete model.exportedLicenseFullSerial;
    return model;
  }
}
