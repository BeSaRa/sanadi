import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigurationService} from "@app/services/configuration.service";
import {catchError, debounceTime, map, switchMap, takeUntil} from "rxjs/operators";
import {iif, Observable, of, Subject} from "rxjs";
import {MapMarker} from "@angular/google-maps";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {
  ContextMenuItemComponent
} from "@app/modules/context-menu/components/context-menu-item/context-menu-item.component";
import {LangService} from "@app/services/lang.service";
import {UrlService} from "@app/services/url.service";
import {MapService} from "@app/services/map.service";


@Component({
  selector: 'raca-maps',
  templateUrl: './raca-maps.component.html',
  styleUrls: ['./raca-maps.component.scss']
})
export class RacaMapsComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input()
  viewOnly: boolean = false;
  @Input()
  center: google.maps.LatLngLiteral = {lat: 25.326414, lng: 51.5336739};
  @Input()
  markerPosition: google.maps.LatLngLiteral = {lat: 0, lng: 0};
  @Output()
  markerUpdates: EventEmitter<google.maps.LatLngLiteral | null> = new EventEmitter<google.maps.LatLngLiteral | null>();
  @Input()
  zoom: number = 18;

  loaded: Observable<boolean>;
  destroy$: Subject<any> = new Subject<any>();

  markerOptions: google.maps.MarkerOptions = {draggable: true};

  @Input()
  hasMarker: boolean = false;

  @ViewChild(MapMarker)
  marker!: MapMarker

  private markerUpdate$: Subject<google.maps.LatLngLiteral> = new Subject<google.maps.LatLngLiteral>();


  mapOptions: google.maps.MapOptions = {streetViewControl: false};

  @Output()
  mapLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();

  actions: IMenuItem<google.maps.MapMouseEvent>[] = [
    {
      type: 'action',
      label: () => this.hasMarker ? this.lang.map.update_marker_position : this.lang.map.add_marker,
      onClick: (event) => {
        this.addMarkerOrUpdateIfExists(event);
      }
    }
  ];

  markerActions: IMenuItem<google.maps.MapMouseEvent> [] = [{
    type: 'action',
    label: 'remove_marker',
    onClick: () => {
      this.removeMarker();
    }
  }]

  constructor(private http: HttpClient,
              private lang: LangService,
              private urlService: UrlService,
              private mapService: MapService,
              private configuration: ConfigurationService) {

    this.loaded = of(this.mapService.loaded)
      .pipe(switchMap(loaded => iif(() => loaded, of(true), this.http.jsonp(`${this.urlService.URLS.MAP_API_URL}${this.configuration.CONFIG.MAP_API_KEY}`, 'callback'))))
      .pipe(
        map(() => {
          this.mapService.loaded = true;
          this.markerOptions.animation = google.maps.Animation.DROP;
          this.mapLoaded.emit(true);
          return true
        }),
        catchError((e) => {
          console.log(e);
          return of(false)
        })
      )
  }

  ngAfterViewInit(): void {
    if (this.viewOnly) {
      Promise.resolve().then(() => {
        this.marker.marker?.setAnimation(google.maps.Animation.BOUNCE);
      })
    }
  }

  ngOnInit(): void {
    this.listenToMarkerUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  rightClicked(menu: ContextMenuItemComponent, event: google.maps.MapMouseEvent) {
    if (this.viewOnly) {
      return;
    }
    menu.open(event.domEvent as MouseEvent, event)
  }

  private addMarkerOrUpdateIfExists(event: google.maps.MapMouseEvent) {
    this.hasMarker = true;
    this.markerPosition = event.latLng!.toJSON();
    this.markerUpdates.emit(this.markerPosition);
  }

  removeMarker() {
    this.hasMarker = false;
    this.markerUpdates.emit(null);
  }

  markerUpdate() {
    if (this.viewOnly) {
      return;
    }
    this.markerUpdate$.next(this.marker.getPosition()!.toJSON());
  }

  private listenToMarkerUpdates() {
    this.markerUpdate$
      .pipe(debounceTime(300))
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.markerUpdates.emit(val);
      })
  }
}
