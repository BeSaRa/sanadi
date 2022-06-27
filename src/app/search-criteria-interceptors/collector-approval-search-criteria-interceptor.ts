import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {CollectorApprovalSearchCriteria} from '@app/models/collector-approval-search-criteria';
import {CollectorItem} from '@app/models/collector-item';
import { CollectorApprovalInterceptor } from "@app/model-interceptors/collector-approval-interceptor";

export class CollectorApprovalSearchCriteriaInterceptor implements IModelInterceptor<CollectorApprovalSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new CollectorApprovalInterceptor()
  send(model: Partial<CollectorApprovalSearchCriteria>): Partial<CollectorApprovalSearchCriteria> {
    if(model.exportedLicenseFullSerial) {
      model.collectorItemList = [
        {
          exportedLicenseFullSerial: model.exportedLicenseFullSerial
        }
      ] as CollectorItem[];
    }

    delete model.exportedLicenseFullSerial;
    return model;
  }

  receive(model: CollectorApprovalSearchCriteria): CollectorApprovalSearchCriteria {
    return model;
  }
}
