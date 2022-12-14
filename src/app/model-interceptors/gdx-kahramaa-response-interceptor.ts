import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';
import {DateUtils} from '@helpers/date-utils';

export class GdxKahramaaResponseInterceptor implements IModelInterceptor<GdxKahramaaResponse>{
  receive(model: GdxKahramaaResponse): GdxKahramaaResponse {
    model.lastInvoiceDateString = DateUtils.getDateStringFromDate(model.lastInvoiceDate, 'DEFAULT_DATE_FORMAT');
    return model;
  }

  send(model: Partial<GdxKahramaaResponse>): Partial<GdxKahramaaResponse> {
    GdxKahramaaResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxKahramaaResponse>): void {
    delete model.searchFields;
    delete model.lastInvoiceDateString;
  }
}
