import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {DialogRef} from '@app/shared/models/dialog-ref';
import { ControlValueLabelLangKey } from '@app/types/types';
import {FactoryService} from '@services/factory.service';
import {MapService} from '@services/map.service';
import { AdminResult } from './admin-result';

export class ProjectAddress extends SearchableCloneable<ProjectAddress> implements IAuditModelProperties<ProjectAddress> {
  beneficiaryRegion!: string;
  address?: string;
  latitude!: string;
  longitude!: string;
  location!: string;
  mapService?: MapService;
  defaultLatLng?: google.maps.LatLngLiteral = {
    lat: 25.3266204,
    lng: 51.5310087
  }
  getAdminResultByProperty(property: keyof ProjectAddress): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      beneficiaryRegion:{ langKey: 'region', value: this.beneficiaryRegion },
      address:{ langKey: 'address_details', value: this.address },
      latitude:{ langKey: 'latitude', value: this.latitude },
      longitude:{ langKey: 'longitude', value: this.longitude },
      location:{ langKey: 'item_location', value: this.location },
    };
  }
  constructor() {
    super();
    this.mapService = FactoryService.getService('MapService');
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
    return this.mapService!.openMap({
      viewOnly,
      zoom: 18,
      center: this.hasMarker() ? this.getLngLat() : this.defaultLatLng!,
      marker: this.hasMarker() ? this.getLngLat() : undefined
    })
  }
}
