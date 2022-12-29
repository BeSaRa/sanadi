import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMolPayroll} from '@app/models/gdx-mol-payroll';

export class GdxMolPayrollInterceptor implements IModelInterceptor<GdxMolPayroll>{
  receive(model: GdxMolPayroll): GdxMolPayroll {
    return model;
  }

  send(model: Partial<GdxMolPayroll>): Partial<GdxMolPayroll> {
    delete model.searchFields;
    return model;
  }
}
