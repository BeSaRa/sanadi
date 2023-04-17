import {AdminResult} from "@app/models/admin-result";
import {HasLicenseApproval} from "@app/interfaces/has-license-approval";
import {MapService} from "@app/services/map.service";
import {FactoryService} from "@app/services/factory.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {mixinApprovalLicenseWithDuration} from "@app/mixins/mixin-approval-license-with-duration";
import {mixinCollectionItemBuildForm} from "@app/mixins/mixin-collection-item-build-form";
import {HasCollectionItemBuildForm} from "@app/interfaces/has-collection-item-build-form";
import { IAuditModelProperties } from "@app/interfaces/i-audit-model-properties";
import { AuditOperationTypes } from "@app/enums/audit-operation-types";
import { CommonUtils } from "@app/helpers/common-utils";

const _LicenseApproval = mixinCollectionItemBuildForm(mixinApprovalLicenseWithDuration(class {
}))

export class CollectionItem extends _LicenseApproval implements HasLicenseApproval, HasCollectionItemBuildForm,IAuditModelProperties<CollectionItem> {
  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  buildingNumber!: string
  identificationNumber!: string
  itemId!: string
  locationDetails!: string
  latitude!: string
  longitude!: string
  requestClassification!: number
  streetNumber!: string
  unitNumber!: string
  zoneNumber!: string
  licenseStatusInfo!: AdminResult
  licenseDurationTypeInfo!: AdminResult
  licenseEndDateString: string = '';

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
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof CollectionItem): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
