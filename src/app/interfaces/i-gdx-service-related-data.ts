import { GdxEidCharitableFoundationResponse } from './../models/gdx-eid-charitable-foundation-response';
import { GdxQatarRedCrescentResponse } from '../models/gdx-qatar-red-crescent-response';
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
import { GdxMoeInstallment } from '@app/models/gdx-moe-Installment';
import { GdxMoePrivateSchoolPendingPayment } from '@app/models/gdx-moe-private-school-pending-payment';
import { GdxMoeResponse } from '@app/models/gdx-moe-pending-installments';
import { GdxMmeResponse } from '@app/models/gdx-mme-leased-contract';
import { GdxQatarCharityResponse } from '@app/models/gdx-qatar-charity-response';
import { GdxMsdfSecurityResponse } from '@app/models/gdx-msdf-security';
import { GdxMsdfHousingResponse } from '@app/models/gdx-msdf-housing';
import {GdxQcbIbanResponse} from '@models/gdx-qcb-iban-response';

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
  [GdxServiceRelatedTypesEnum.MOE_STUDENT_INFO]: GdxMoeResponse[],
  [GdxServiceRelatedTypesEnum.MOE_INSTALLMENTS]: GdxMoeInstallment[],
  [GdxServiceRelatedTypesEnum.MOE_PENDING_PAYMENTS]: GdxMoePrivateSchoolPendingPayment[],
  [GdxServiceRelatedTypesEnum.MME_LEASED_CONTRACT]: GdxMmeResponse[],
  [GdxServiceRelatedTypesEnum.QATAR_CHARITY]: GdxQatarCharityResponse[],
  [GdxServiceRelatedTypesEnum.QATAR_RED_CRESCENT]: GdxQatarRedCrescentResponse[],
  [GdxServiceRelatedTypesEnum.EID_CHARITABLE_FOUNDATION]: GdxEidCharitableFoundationResponse[],
  [GdxServiceRelatedTypesEnum.HOUSING_BENEFICIARY_STATUS]: GdxMsdfHousingResponse[],
  [GdxServiceRelatedTypesEnum.SECURITY_BENEFICIARY_STATUS]: GdxMsdfSecurityResponse[],
  [GdxServiceRelatedTypesEnum.QCB_IBAN]: GdxQcbIbanResponse[],
}
