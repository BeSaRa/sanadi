import { AdminResult } from '@app/models/admin-result';
import { Cloneable } from "@models/cloneable";
import { CustomValidators } from "@app/validators/custom-validators";
import currency from "currency.js";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { FactoryService } from "@services/factory.service";
import { ProjectImplementationService } from "@services/project-implementation.service";
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { ImplementationFundraising } from "@models/implementation-fundraising";
import { ImplementationTemplateInterceptor } from "@model-interceptors/implementation-template-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import { ControlValueLabelLangKey } from '@app/types/types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

const { send, receive } = new ImplementationTemplateInterceptor()

@InterceptModel({ send, receive })
export class ImplementationTemplate extends Cloneable<ImplementationTemplate> implements IAuditModelProperties<ImplementationTemplate> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  templateId!: string
  templateName!: string
  arabicName!: string
  englishName!: string
  executionCountry!: number
  templateCost!: number
  latitude!: string
  longitude!: string
  beneficiaryRegion!: string
  region!: string
  notes!: string
  projectTotalCost!: number
  executionCountryInfo!: AdminResult
  targetAmount!: number;
  // not related to the model -- should be deleted before send to backend
  defaultLatLng: google.maps.LatLngLiteral = {
    lat: 25.3266204,
    lng: 51.5310087
  }
  service: ProjectImplementationService

  constructor() {
    super();
    this.service = FactoryService.getService('ProjectImplementationService')
  }

  buildForm(controls: boolean) {
    const values = ObjectUtils.getControlValues<ImplementationTemplate>(this.getValuesWithLabels())

    return {
      arabicName: controls ? [values.arabicName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : values.arabicName,
      englishName: controls ? [values.englishName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : values.englishName,
      latitude: controls ? [values.latitude, CustomValidators.required] : values.latitude,
      longitude: controls ? [values.longitude, CustomValidators.required] : values.longitude,
      beneficiaryRegion: controls ? [values.beneficiaryRegion, [CustomValidators.required, CustomValidators.maxLength(300)]] : values.beneficiaryRegion,
      notes: controls ? [values.notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),]] :values. notes,
      projectTotalCost: controls ? [values.projectTotalCost, CustomValidators.required] : values.projectTotalCost
    };
  }

  getAdminResultByProperty(property: keyof ImplementationTemplate): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'executionCountry':
        adminResultValue = this.executionCountryInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {

      templateName: { langKey: 'name', value: this.templateName },
      executionCountry: { langKey: 'execution_country', value: this.executionCountry },
      templateCost: { langKey: 'total_cost', value: this.templateCost },
      longitude: { langKey: 'longitude', value: this.longitude },
      latitude: { langKey: 'latitude', value: this.latitude },
      beneficiaryRegion: { langKey: 'beneficiary_country', value: this.beneficiaryRegion },
      region: { langKey: 'region', value: this.region },
      targetAmount: { langKey: 'target_amount', value: this.targetAmount },
      arabicName: { langKey: 'lbl_arabic_name', value: this.arabicName },
      englishName: { langKey: 'lbl_english_name', value: this.englishName },
      projectTotalCost: { langKey: 'project_total_cost', value: this.projectTotalCost },
      notes: { langKey: 'notes', value: this.notes },
    };
  }
  setProjectTotalCost(value: number): void {
    this.projectTotalCost = currency(value).value
  }

  hasMarker(): boolean {
    return !!this.longitude && !!this.latitude;
  }

  getLngLat(): google.maps.LatLngLiteral {
    return {
      lat: Number(this.latitude),
      lng: Number(this.longitude)
    }
  }

  openMap(viewOnly: boolean = false): DialogRef {
    return this.service.openMap(viewOnly, this)
  }

  edit(): DialogRef {
    return this.service.openImplementationTemplateDialog(this)
  }

  view(): DialogRef {
    return this.service.openImplementationTemplateDialog(this, true)
  }

  loadImplementationFundraising(requestType: number, caseId?: string): Observable<ImplementationFundraising | undefined> {
    return this.service
      .loadRelatedPermitByTemplate(requestType, this.templateId, caseId)
      .pipe(switchMap((license) => {
        return license ? of(license.convertToFundraisingTemplate().clone({
          projectTotalCost: license.targetAmount,
          consumedAmount: license.consumed || 0,
          remainingAmount: license.targetAmount - (license.consumed || 0),
          isMain: true
        })) : of(undefined)
      }))
  }

}
