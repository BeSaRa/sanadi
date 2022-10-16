import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FactoryService} from '@services/factory.service';
import {MapService} from '@services/map.service';

export class ProjectAddress extends SearchableCloneable<ProjectAddress> {
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
