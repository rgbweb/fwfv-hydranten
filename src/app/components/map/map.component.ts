import {
  AfterViewChecked,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Control,
  DivIcon,
  LatLng,
  LatLngBounds,
  Layer,
  LeafletMouseEvent,
  LocationEvent,
  Map,
  MapOptions,
  latLng,
  marker,
  tileLayer,
} from 'leaflet';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Hydrant } from 'src/app/types/hydrant.class';
import { nameof } from 'src/app/utils/nameof';
import { HydrantDialogComponent } from '../hydrant-dialog/hydrant-dialog.component';
import { NgxLeafletLocateComponent } from '@runette/ngx-leaflet-locate';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const DEFAULT_CENTER: LatLng = latLng(52.520262523297994, 13.75383048808331);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges, OnInit, AfterViewChecked {
  @ViewChild(NgxLeafletLocateComponent, { static: false })
  locateComponent: NgxLeafletLocateComponent | null = null;

  @Input() hydrants: Hydrant[] = [];
  @Input() higlightedHydrants: Hydrant[] = [];

  mapOptions: MapOptions;
  fitBounds: LatLngBounds | null = null;
  hydrantLayers: Layer[] = [];

  mapInstance: Map | null = null;

  locateControlOptions: Control.LocateOptions;
  isGeolocationEnabled = false;

  customTooltipsStyleElement: SafeHtml | undefined;

  private hydrantIcon: DivIcon;
  private isLocateControlStarted = false;

  constructor(
    private modalService: BsModalService,
    private sanitizer: DomSanitizer
  ) {
    this.mapOptions = {
      layers: [
        tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
          minZoom: 12,
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
      zoom: 15,
      center: DEFAULT_CENTER,
    };

    this.locateControlOptions = {
      position: 'bottomleft',
      locateOptions: {
        enableHighAccuracy: true,
      },
      clickBehavior: {
        inView: 'setView',
        outOfView: 'setView',
        inViewNotFollowing: 'setView',
      },
      showPopup: false,
    };

    this.hydrantIcon = new DivIcon({
      html: '',
      iconSize: [0, 0],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hasHydrantsChanges = !!changes[nameof<MapComponent>('hydrants')];
    const hasHiglightedHydrants =
      !!changes[nameof<MapComponent>('higlightedHydrants')];

    if (hasHydrantsChanges) {
      this.createHydrantLayers();
    }

    if (hasHiglightedHydrants) {
      this.updateHighlightedHydrantsStyle();
      this.updateHightlightedMapBounds();
    }
  }

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition(() => {
      this.isGeolocationEnabled = true;
    });
  }

  ngAfterViewChecked() {
    if (!this.isLocateControlStarted && this.locateComponent?.control) {
      setTimeout(() => this.locateComponent?.control.start(), 100);

      this.isLocateControlStarted = true;
    }
  }

  onMapReady(map: Map) {
    this.mapInstance = map;
  }

  private createHydrantLayers() {
    this.hydrantLayers = this.hydrants.map((hydrant) => {
      const pin = marker([hydrant.lat, hydrant.lon], {
        icon: this.hydrantIcon,
      });

      const uniqueClass = this.getUniqueTooltipClass(hydrant);

      pin.bindTooltip(hydrant.reference, {
        permanent: true,
        direction: 'top',
        opacity: 1,
        interactive: true,
        className: `hydrant-tooltip ${uniqueClass}`,
      });

      pin.on('click', (event: LeafletMouseEvent) => {
        event.originalEvent.stopPropagation();
        this.openHydrantDialog(hydrant);
      });

      return pin;
    });
  }

  private getUniqueTooltipClass(hydrant: Hydrant): string {
    return 'hydrant-tooltip__' + hydrant.id;
  }

  private updateHighlightedHydrantsStyle() {
    const highlightedClasses = [];
    for (const hydrant of this.hydrants) {
      if (this.higlightedHydrants.includes(hydrant)) {
        highlightedClasses.push('.' + this.getUniqueTooltipClass(hydrant));
      }
    }

    if (highlightedClasses.length) {
      this.customTooltipsStyleElement = this.sanitizer.bypassSecurityTrustHtml(`
        <style>
          ${highlightedClasses.join(',')} {
            background: #ee1d25;
            border-color: #ee1d25;
            color: #fff;
            z-index: 2;

            &::before {
              border-top-color: #ee1d25;
            }
          }
        </style>
      `);
    } else {
      this.customTooltipsStyleElement = undefined;
    }
  }

  private updateHightlightedMapBounds() {
    const hydrants = this.higlightedHydrants;

    if (!hydrants.length) {
      return;
    }

    const firstHydrant = hydrants[0];
    let north: number = firstHydrant.lat;
    let east: number = firstHydrant.lon;
    let south: number = firstHydrant.lat;
    let west: number = firstHydrant.lon;

    for (const hydrant of hydrants) {
      if (north === null || hydrant.lat > north) {
        north = hydrant.lat;
      }
      if (south === null || hydrant.lat < south) {
        south = hydrant.lat;
      }
      if (east === null || hydrant.lat > east) {
        east = hydrant.lon;
      }
      if (west === null || hydrant.lat < west) {
        west = hydrant.lon;
      }
    }

    const bounds = new LatLngBounds([south, west], [north, east]);
    this.fitBounds = bounds;
  }

  private openHydrantDialog(hydrant: Hydrant) {
    const modalOptions: ModalOptions<HydrantDialogComponent> = {
      initialState: {
        hydrant,
      },
    };
    this.modalService.show(HydrantDialogComponent, modalOptions);
  }
}
