import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxServiceLog} from '@app/models/gdx-service-log';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {DateUtils} from '@helpers/date-utils';
import {GdxServicesEnum} from '@app/enums/gdx-services.enum';
import {GdxMociResponseInterceptor} from '@app/model-interceptors/gdx-moci-response-interceptor';
import {GdxMojResponseInterceptor} from '@app/model-interceptors/gdx-moj-response-interceptor';
import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {GdxGarsiaPensionResponseInterceptor} from '@app/model-interceptors/gdx-garsia-pension-response-interceptor';
import {GdxMawaredResponseInterceptor} from '@app/model-interceptors/gdx-mawared-response-interceptor.interceptor';
import {GdxKahramaaResponseInterceptor} from '@app/model-interceptors/gdx-kahramaa-response-interceptor';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';
import {GdxMolPayrollResponseInterceptor} from '@app/model-interceptors/gdx-mol-payroll-response-interceptor';
import {GdxSjcResponseInterceptor} from '@model-interceptors/gdx-sjc-response-interceptor';

const gdxMojResponseInterceptor = new GdxMojResponseInterceptor();
const gdxMociResponseInterceptor = new GdxMociResponseInterceptor();
const gdxMawaredResponseInterceptor = new GdxMawaredResponseInterceptor();
const gdxGarsiaPensionResponseInterceptor = new GdxGarsiaPensionResponseInterceptor();
const gdxKahramaaResponseInterceptor = new GdxKahramaaResponseInterceptor();
const gdxMolPayrollResponseInterceptor = new GdxMolPayrollResponseInterceptor();
const gdxSjcResponseInterceptor = new GdxSjcResponseInterceptor();

export class GdxServiceLogInterceptor implements IModelInterceptor<GdxServiceLog> {
  receive(model: GdxServiceLog): GdxServiceLog {
    model.gdxServiceId = '' + model.gdxServiceId;
    model.actionTimeString = DateUtils.getDateStringFromDate(model.actionTime, 'TIMESTAMP');
    model.orgUserInfo && (model.orgUserInfo = AdminResult.createInstance(model.orgUserInfo));
    model.orgInfo && (model.orgInfo = AdminResult.createInstance(model.orgInfo));
    try {
      if (CommonUtils.isValidValue(model.gdxServiceResponse)) {
        let parsed = JSON.parse(model.gdxServiceResponse);
        if (!Array.isArray(parsed)) {
          model.gdxServiceResponseParsed = parsed;
        } else {
          model.gdxServiceResponseList = parsed;
        }
      }
      GdxServiceLogInterceptor._typeCastServiceResponse(model);
    } catch (error) {
      model.gdxServiceResponseParsed = {};
      model.gdxServiceResponseList = [];
    }
    return model;
  }

  send(model: Partial<GdxServiceLog>): Partial<GdxServiceLog> {
    GdxServiceLogInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxServiceLog> | any): void {
    delete model.orgUserInfo;
    delete model.orgInfo;
    delete model.gdxServiceResponseList;
    delete model.gdxServiceResponseParsed;
    delete model.actionTimeString;
  }

  private static _typeCastServiceResponse(model: GdxServiceLog) {
    switch (model.gdxServiceId) {
      case GdxServicesEnum.MOJ:
        model.gdxServiceResponseParsed = gdxMojResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      case GdxServicesEnum.MOCI:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxMociResponseInterceptor.receive(new GdxMociResponse().clone(x));
        });
        break;
      case GdxServicesEnum.MAWARED:
        model.gdxServiceResponseParsed = gdxMawaredResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      case GdxServicesEnum.GARSIA:
        model.gdxServiceResponseParsed = gdxGarsiaPensionResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      case GdxServicesEnum.KAHRAMAA:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxKahramaaResponseInterceptor.receive(new GdxKahramaaResponse().clone(x));
        });
        break;
      case GdxServicesEnum.MOL:
        model.gdxServiceResponseParsed = gdxMolPayrollResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      case GdxServicesEnum.SJC:
        model.gdxServiceResponseParsed = gdxSjcResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      default:
        break;
    }
  }
}
