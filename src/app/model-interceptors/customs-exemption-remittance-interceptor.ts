import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import {CustomsExemptionRemittance} from '@app/models/customs-exemption-remittance';

export class CustomsExemptionRemittanceInterceptor implements IModelInterceptor<CustomsExemptionRemittance> {
  send(model: Partial<CustomsExemptionRemittance>): Partial<CustomsExemptionRemittance> {
    delete model.requestTypeInfo;
    delete model.shipmentSourceInfo;
    delete model.shipmentCarrierInfo;
    delete model.receiverNameInfo;
    return model;
  }
  receive(model: CustomsExemptionRemittance): CustomsExemptionRemittance {
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.shipmentSourceInfo = AdminResult.createInstance(model.shipmentSourceInfo);
    model.shipmentCarrierInfo = AdminResult.createInstance(model.shipmentCarrierInfo);
    model.receiverNameInfo = AdminResult.createInstance(model.receiverNameInfo);
    return model;
  }
}
