import {GdxMociResponse} from '@app/models/gdx-moci-response';
import {GdxMawaredResponse} from '@app/models/gdx-mawared-response';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {GdxKahramaaResponse} from '@app/models/gdx-kahramaa-response';
import {GdxServiceRelatedTypesEnum} from '@app/enums/gdx-service-related-types.enum';
import {GdxFlatInfo} from '@app/models/gdx-flat-info';
import {GdxParcelInfo} from '@app/models/gdx-parcel-info';
import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';
import {GdxMolPayroll} from '@app/models/gdx-mol-payroll';
import {GdxSjcMaritalStatusResponse} from '@models/gdx-sjc-marital-status-response';

export interface IGdxServiceRelatedData {
  [GdxServiceRelatedTypesEnum.MOJ_FLATS]: GdxFlatInfo[],
  [GdxServiceRelatedTypesEnum.MOJ_PARCELS]: GdxParcelInfo[],
  [GdxServiceRelatedTypesEnum.MOCI_COMPANIES]: GdxMociResponse[],
  [GdxServiceRelatedTypesEnum.MAWARED_EMPLOYEES]: GdxMawaredResponse[],
  [GdxServiceRelatedTypesEnum.GARSIA_PENSION]: GdxGarsiaPensionResponse[],
  [GdxServiceRelatedTypesEnum.GARSIA_PENSION_PAYMENT]: GdxPensionMonthPayment[],
  [GdxServiceRelatedTypesEnum.KAHRAMAA_OUTSTANDING_PAYMENTS]: GdxKahramaaResponse[],
  [GdxServiceRelatedTypesEnum.MOL_RELATED_DATA]: GdxMolPayroll[],
  [GdxServiceRelatedTypesEnum.SJC_RELATED_DATA]: GdxSjcMaritalStatusResponse[],
}
