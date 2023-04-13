import {WFResponseType} from '@app/enums/wfresponse-type.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {CustomsExemptionRemittance} from '@app/models/customs-exemption-remittance';

export class CustomsExemptionRemittanceInterceptor implements IModelInterceptor<CustomsExemptionRemittance> {
  send(model: Partial<CustomsExemptionRemittance>): Partial<CustomsExemptionRemittance> {
    CustomsExemptionRemittanceInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: CustomsExemptionRemittance): CustomsExemptionRemittance {
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.shipmentSourceInfo = AdminResult.createInstance(model.shipmentSourceInfo);
    model.shipmentCarrierInfo = AdminResult.createInstance(model.shipmentCarrierInfo);
    model.receiverNameInfo = AdminResult.createInstance(model.receiverNameInfo);
    model.receiverTypeInfo = AdminResult.createInstance(model.receiverTypeInfo);
    model.countryInfo = AdminResult.createInstance(model.countryInfo);
    model.linkedProjectInfo = AdminResult.createInstance(model.linkedProjectInfo);

    if (model.getCaseStatus() === CommonCaseStatus.CANCELLED) {
      if (!!model.taskDetails?.responses) {
        model.taskDetails.responses = [WFResponseType.CLOSE]
      }
    }
    return model;
  }

  private static _deleteBeforeSend(model: Partial<CustomsExemptionRemittance>): void {
    delete model.requestTypeInfo;
    delete model.shipmentSourceInfo;
    delete model.shipmentCarrierInfo;
    delete model.receiverNameInfo;
    delete model.receiverTypeInfo;
    delete model.countryInfo;
    delete model.linkedProjectInfo;
    delete model.auditOperation;
  }
}
