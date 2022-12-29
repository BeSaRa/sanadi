import {GdxMolPayroll} from '@app/models/gdx-mol-payroll';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxMolPayrollResponseInterceptor} from '@app/model-interceptors/gdx-mol-payroll-response-interceptor';
import {Cloneable} from '@app/models/cloneable';

const gdxMolPayrollResponseInterceptor = new GdxMolPayrollResponseInterceptor();

@InterceptModel({
  receive: gdxMolPayrollResponseInterceptor.receive
})
export class GdxMolPayrollResponse {
  status!: boolean;
  payRollList: GdxMolPayroll[] = [];
}
