import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMolPayrollResponse} from '@app/models/gdx-mol-payroll-response';
import {GdxMolPayroll} from '@app/models/gdx-mol-payroll';
import {GdxMolPayrollInterceptor} from '@app/model-interceptors/gdx-mol-payroll-interceptor';

let gdxMolPayrollInterceptor = new GdxMolPayrollInterceptor();

export class GdxMolPayrollResponseInterceptor implements IModelInterceptor<GdxMolPayrollResponse> {
  receive(model: GdxMolPayrollResponse): GdxMolPayrollResponse {
    model.payRollList = (model.payRollList ?? []).map((item: GdxMolPayroll) => {
      return gdxMolPayrollInterceptor.receive(new GdxMolPayroll().clone(item));
    });
    return model;
  }

  send(model: Partial<GdxMolPayrollResponse>): Partial<GdxMolPayrollResponse> {
    model.payRollList = (model.payRollList ?? []).map((item: GdxMolPayroll) => {
      return gdxMolPayrollInterceptor.send(item) as GdxMolPayroll;
    });
    return model;
  }

}
