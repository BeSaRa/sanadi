import {AdminResult} from '@app/models/admin-result';
import {Cloneable} from "@models/cloneable";
import {CustomValidators} from "@app/validators/custom-validators";
import currency from "currency.js";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {FactoryService} from "@services/factory.service";
import {ProjectImplementationService} from "@services/project-implementation.service";
import {Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {ImplementationTemplateInterceptor} from "@model-interceptors/implementation-template-interceptor";
import {InterceptModel} from "@decorators/intercept-model";

const {send, receive} = new ImplementationTemplateInterceptor()

@InterceptModel({send, receive})
export class ImplementationTemplate extends Cloneable<ImplementationTemplate> {
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
    const {
      arabicName,
      englishName,
      latitude,
      longitude,
      beneficiaryRegion,
      projectTotalCost,
      notes
    } = this;
    return {
      arabicName: controls ? [arabicName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arabicName,
      englishName: controls ? [englishName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : englishName,
      latitude: controls ? [latitude, CustomValidators.required] : latitude,
      longitude: controls ? [longitude, CustomValidators.required] : longitude,
      beneficiaryRegion: controls ? [beneficiaryRegion, [CustomValidators.required, CustomValidators.maxLength(300)]] : beneficiaryRegion,
      notes: controls ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS),]] : notes,
      projectTotalCost: controls ? [projectTotalCost, CustomValidators.required] : projectTotalCost
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

  loadImplementationFundraising(requestType: number , caseId?: string): Observable<ImplementationFundraising | undefined> {
    return this.service
      .loadRelatedPermitByTemplate(requestType , this.templateId, caseId)
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
