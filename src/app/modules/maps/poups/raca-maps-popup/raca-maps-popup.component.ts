import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {DialogService} from "@app/services/dialog.service";
import {ICoordinates} from "@app/interfaces/ICoordinates";
import {UserClickOn} from "@app/enums/user-click-on.enum";

@Component({
  selector: 'raca-maps-popup',
  templateUrl: './raca-maps-popup.component.html',
  styleUrls: ['./raca-maps-popup.component.scss']
})
export class RacaMapsPopupComponent {
  viewOnly: boolean = false;
  center: google.maps.LatLngLiteral;
  marker?: google.maps.LatLngLiteral;
  zoom: number = 18;
  hideInputs: boolean = false;

  markerPosition: google.maps.LatLngLiteral | undefined;
  loaded: boolean = false;

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              private dialog: DialogService,
              @Inject(DIALOG_DATA_TOKEN) private data: {
                viewOnly: boolean,
                center: google.maps.LatLngLiteral,
                marker: google.maps.LatLngLiteral
                zoom: number,
                hideInputs: boolean
              }
  ) {
    this.marker = data.marker;
    this.center = data.center;
    this.zoom = data.zoom;
    this.viewOnly = data.viewOnly;
    this.hideInputs = data.hideInputs;
  }

  markerUpdate($event: google.maps.LatLngLiteral | null): void {
    $event ? (this.markerPosition = $event) : (this.markerPosition = undefined);
  }


  saveMarker(): void {
    if (!this.markerPosition) {
      this.dialog.error(this.lang.map.please_add_marker_to_perform_this_action);
      return;
    }
    this.dialogRef.close<{ click: UserClickOn, value: ICoordinates }>({
      click: UserClickOn.YES,
      value: {
        latitude: this.markerPosition?.lat.toString(),
        longitude: this.markerPosition?.lng.toString(),
      }
    })
  }

  setLoadStatus($event: boolean) {
    Promise.resolve().then(() => this.loaded = $event);
  }
}
