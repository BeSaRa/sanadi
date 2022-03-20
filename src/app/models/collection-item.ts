import {AdminResult} from "@app/models/admin-result";
import {CustomValidators} from "@app/validators/custom-validators";
import {HasLicenseApproval} from "@app/interfaces/has-license-approval";
import {MapService} from "@app/services/map.service";
import {FactoryService} from "@app/services/factory.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {mixinApprovalLicenseWithDuration} from "@app/mixins/mixin-approval-license-with-duration";

const _LicenseApproval = mixinApprovalLicenseWithDuration(class {
})

export class CollectionItem extends _LicenseApproval implements HasLicenseApproval {
  buildingNumber!: string
  identificationNumber!: string
  locationDetails!: string
  latitude!: string
  longitude!: string
  requestClassification!: number
  streetNumber!: string
  unitNumber!: string
  zoneNumber!: string
  licenseStatusInfo!: AdminResult
  licenseDurationTypeInfo!: AdminResult

  // to be removed while sending to backend
  mapService: MapService;
  defaultLatLng: google.maps.LatLngLiteral = {
    lat: 25.3266204,
    lng: 51.5310087
  }

  constructor() {
    super();
    this.mapService = FactoryService.getService('MapService');
  }

  buildForm(controls: boolean = false): any {
    const {
      identificationNumber,
      locationDetails,
      buildingNumber,
      streetNumber,
      zoneNumber,
      unitNumber,
      latitude,
      longitude,
      licenseEndDate,
      oldLicenseFullSerial
    } = this;
    return {
      identificationNumber: controls ? [identificationNumber, [CustomValidators.required]] : identificationNumber,
      locationDetails: controls ? [locationDetails, [CustomValidators.required]] : locationDetails,
      buildingNumber: controls ? [buildingNumber, [CustomValidators.required]] : buildingNumber,
      streetNumber: controls ? [streetNumber, [CustomValidators.required]] : streetNumber,
      zoneNumber: controls ? [zoneNumber, [CustomValidators.required]] : zoneNumber,
      unitNumber: controls ? [unitNumber, [CustomValidators.required]] : unitNumber,
      latitude: controls ? [{value: latitude, disabled: true}, [CustomValidators.required]] : latitude,
      longitude: controls ? [{value: longitude, disabled: true}, [CustomValidators.required]] : longitude,
      licenseEndDate: controls ? [licenseEndDate] : licenseEndDate,
      oldLicenseFullSerial: controls ? [oldLicenseFullSerial] : oldLicenseFullSerial,
    }
  }

  hasMarker(): boolean {
    return !!this.longitude && !!this.latitude;
  }

  openMap(viewOnly: boolean = false): DialogRef {
    return this.mapService.openMap({
      viewOnly,
      zoom: 18,
      center: this.hasMarker() ? this.getLngLat() : this.defaultLatLng,
      marker: this.hasMarker() ? this.getLngLat() : undefined
    })
  }

  getLngLat(): google.maps.LatLngLiteral {
    return {
      lat: Number(this.latitude),
      lng: Number(this.longitude)
    }
  }
}
