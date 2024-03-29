import { GdxMsdfSecurityResponseInterceptor } from './gdx-msdf-security-response-interceptor';
import { GdxMsdfHousingResponseInterceptor } from './gdx-msdf-housing-response-interceptor';
import { GdxEidCharitableFoundationResponse } from '@app/models/gdx-eid-charitable-foundation-response';
import { GdxEidCharitableFoundationResponseInterceptor } from '@app/model-interceptors/gdx-eid-charitable-foundation-response-interceptor';
import { GdxQatarRedCrescentResponse } from '@app/models/gdx-qatar-red-crescent-response';
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
import { GdxMoeResponseInterceptor } from './gdx-moe-response-interceptor';
import { GdxMoeResponse } from '@app/models/gdx-moe-pending-installments';
import { GdxMmeResponseInterceptor } from './gdx-mme-response-interceptor';
import { GdxMmeResponse } from '@app/models/gdx-mme-leased-contract';
import { GdxQatarCharityResponseInterceptor } from './gdx-qatar-charity-response-interceptor';
import { GdxQatarCharityResponse } from '@app/models/gdx-qatar-charity-response';
import { GdxQatarRedCrescentResponseInterceptor } from './gdx-qatar-red-crescent-response-interceptor';

const gdxMojResponseInterceptor = new GdxMojResponseInterceptor();
const gdxMociResponseInterceptor = new GdxMociResponseInterceptor();
const gdxMawaredResponseInterceptor = new GdxMawaredResponseInterceptor();
const gdxGarsiaPensionResponseInterceptor = new GdxGarsiaPensionResponseInterceptor();
const gdxKahramaaResponseInterceptor = new GdxKahramaaResponseInterceptor();
const gdxMolPayrollResponseInterceptor = new GdxMolPayrollResponseInterceptor();
const gdxSjcResponseInterceptor = new GdxSjcResponseInterceptor();
const gdxMsdfHousingResponseInterceptor = new GdxMsdfHousingResponseInterceptor();
const gdxMsdfSecurityResponseInterceptor = new GdxMsdfSecurityResponseInterceptor();
const gdxMoeResponseInterceptor = new GdxMoeResponseInterceptor();
const gdxMmeResponseInterceptor = new GdxMmeResponseInterceptor();
const gdxQatarCharityResponseInterceptor = new GdxQatarCharityResponseInterceptor();
const gdxQatarRedCrescentResponseInterceptor = new GdxQatarRedCrescentResponseInterceptor();
const gdxEidCharitableFoundationResponseInterceptor = new GdxEidCharitableFoundationResponseInterceptor();

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
      case GdxServicesEnum.MOE:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxMoeResponseInterceptor.receive(new GdxMoeResponse().clone(x));
        });
        break;
      case GdxServicesEnum.MME:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxMmeResponseInterceptor.receive(new GdxMmeResponse().clone(x));
        });
        break;
      case GdxServicesEnum.QATAR_CHARITY:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxQatarCharityResponseInterceptor.receive(new GdxQatarCharityResponse().clone(x));
        });
        break;

      case GdxServicesEnum.QATAR_RED_CRESCENT:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxQatarRedCrescentResponseInterceptor.receive(new GdxQatarRedCrescentResponse().clone(x));
        });
        break;
      case GdxServicesEnum.EID_CHARITABLE_FOUNDATION:
        model.gdxServiceResponseList = model.gdxServiceResponseList.map((x) => {
          return gdxEidCharitableFoundationResponseInterceptor.receive(new GdxEidCharitableFoundationResponse().clone(x));
        });
        break;
      case GdxServicesEnum.HOUSING_BENEFICIARY_STATUS:
        model.gdxServiceResponseParsed = gdxMsdfHousingResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      case GdxServicesEnum.SECURITY_BENEFICIARY_STATUS:
        model.gdxServiceResponseParsed = gdxMsdfSecurityResponseInterceptor.receive(model.gdxServiceResponseParsed);
        break;
      default:
        break;
    }
  }
}
