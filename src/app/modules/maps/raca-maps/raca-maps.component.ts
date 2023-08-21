import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ConfigurationService} from "@app/services/configuration.service";
import {catchError, debounceTime, delay, map, switchMap, take, takeUntil} from "rxjs/operators";
import {iif, Observable, of, Subject} from "rxjs";
import {MapMarker} from "@angular/google-maps";
import {IMenuItem} from "@app/modules/context-menu/interfaces/i-menu-item";
import {
  ContextMenuItemComponent
} from "@app/modules/context-menu/components/context-menu-item/context-menu-item.component";
import {LangService} from "@app/services/lang.service";
import {UrlService} from "@app/services/url.service";
import {MapService} from "@app/services/map.service";
import {TokenService} from "@services/token.service";
import {AbstractControl, FormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {CustomValidators} from "@app/validators/custom-validators";


@Component({
  selector: 'raca-maps',
  templateUrl: './raca-maps.component.html',
  styleUrls: ['./raca-maps.component.scss']
})
export class RacaMapsComponent implements OnDestroy, OnInit {
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

  loaded: boolean = false;
  destroy$: Subject<any> = new Subject<any>();

  markerOptions: google.maps.MarkerOptions = {draggable: true};

  @Input()
  hasMarker: boolean = false;

  @Input()
  hideInputs: boolean = false;

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

  viewOnlyActions: IMenuItem<google.maps.MapMouseEvent>[] = [
    {
      type: 'action',
      label: 'back_to_the_marker',
      onClick: () => {
        this.center = this.marker.getPosition()!.toJSON();
      }
    }
  ];

  markerActions: IMenuItem<google.maps.MapMouseEvent> [] = [{
    type: 'action',
    label: 'remove_marker',
    onClick: () => {
      this.removeMarker();
    }
  }];

  private loader: Observable<boolean>;

  form!: UntypedFormGroup;

  constructor(private http: HttpClient,
              public lang: LangService,
              private urlService: UrlService,
              private mapService: MapService,
              private tokenService: TokenService,
              private fb: FormBuilder,
              private configuration: ConfigurationService) {

    const url = `${this.urlService.URLS.MAP_API_URL}${this.configuration.CONFIG.MAP_API_KEY}`;

    this.tokenService.addExcludedUrl(url + '&callback=JSONP_CALLBACK');

    this.loader = of(this.mapService.loaded)
      .pipe(switchMap(loaded => iif(() => loaded, of(true), this.http.jsonp(`${this.urlService.URLS.MAP_API_URL}${this.configuration.CONFIG.MAP_API_KEY}`, 'callback'))))
      .pipe(
        map(() => {
          this.markerOptions.animation = google.maps.Animation.DROP;
          this.loaded = true;
          return true
        }),
        catchError((_e) => {
          console.log(_e);
          return of(false)
        })
      )
  }

  ngOnInit(): void {
    this.listenToMarkerUpdates();
    this.listenToLoadFinish();
    this.buildForm(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  buildForm(controls: boolean = false) {
    this.form = this.fb.group({
      lat: controls ? [[], [CustomValidators.required, Validators.min(-90), Validators.max(90), CustomValidators.decimal(15), CustomValidators.maxLength(18)]] : this.markerPosition.lat,
      lng: controls ? [[], [CustomValidators.required, Validators.min(-180), Validators.max(180), CustomValidators.decimal(15), CustomValidators.maxLength(18)]] : this.markerPosition.lng
    });
  }

  rightClicked(menu: ContextMenuItemComponent, event: google.maps.MapMouseEvent, viewOnlyMenu?: ContextMenuItemComponent) {
    if (this.viewOnly) {
      viewOnlyMenu?.open(event.domEvent as MouseEvent, event);
      return;
    }
    menu.open(event.domEvent as MouseEvent, event)
  }

  private addMarkerOrUpdateIfExists(event: google.maps.MapMouseEvent) {
    this.hasMarker = true;
    this.markerPosition = event.latLng!.toJSON();
    this.markerUpdates.emit(this.markerPosition);
    this._updateForm(this.markerPosition);
  }

  removeMarker() {
    this.hasMarker = false;
    this.markerUpdates.emit(null);
    this._updateForm(undefined);
  }

  markerUpdate() {
    if (this.viewOnly) {
      return;
    }
    this.markerUpdate$.next(this.marker.getPosition()!.toJSON());
    this._updateForm(this.marker.getPosition()!.toJSON());
  }

  updateMarkerPositionByInput($event: Event): void {
    if (!$event || this.hideInputs || this.viewOnly || this.latitude.invalid || this.longitude.invalid) {
      return;
    }

    this.hasMarker = true;
    this.markerPosition = {lat: Number(this.latitude.value), lng: Number(this.longitude.value)};
    this.center = {lat: Number(this.latitude.value), lng: Number(this.longitude.value)};
    this.markerUpdates.emit(this.markerPosition);
  }

  get latitude(): AbstractControl {
    return this.form.get('lat') as AbstractControl;
  }

  get longitude(): AbstractControl {
    return this.form.get('lng') as AbstractControl;
  }

  private listenToMarkerUpdates() {
    this.markerUpdate$
      .pipe(debounceTime(300))
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.markerUpdates.emit(val);
      })
  }

  private listenToLoadFinish() {
    this.loader
      .pipe(delay(100))
      .pipe(take(1))
      .subscribe(() => {
        this.mapService.loaded = true;
        this.mapLoaded.emit(true);
        this._updateForm(this.markerPosition);
        if (!this.viewOnly) {
          return;
        }
        this.form.disable();
        this.marker.marker?.setDraggable(false);
        this.marker.marker?.setAnimation(google.maps.Animation.BOUNCE);
      })
  }

  private _updateForm(position?: google.maps.LatLngLiteral): void {
    if (this.hideInputs) {
      return;
    }
    if (!position) {
      this.form.reset();
      return;
    }
    this.form.patchValue(position);
  }
}
