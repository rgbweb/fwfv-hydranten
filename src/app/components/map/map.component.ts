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

  private hydrantIcon: DivIcon;
  private isLocateControlStarted = false;

  constructor(private modalService: BsModalService) {
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
      flyTo: true,
      // keepCurrentZoomLevel: true,
      locateOptions: {
        // setView: true,
        // watch: true,
        // maxZoom: 17,
        enableHighAccuracy: true,
      },
      clickBehavior: {
        inView: 'setView',
        outOfView: 'setView',
        inViewNotFollowing: 'setView',
      },
      showPopup: false,
      // setView: 'untilPanOrZoom',
      // initialZoomLevel: 17,
    };

    this.hydrantIcon = new DivIcon({
      html: '',
      // iconUrl: 'assets/5_pixel_by_5_pixel_red_dot_clear_back.png',
      // shadowUrl: 'assets/5_pixel_by_5_pixel_red_dot_clear_back.png',

      iconSize: [0, 0], // size of the icon
      // shadowSize: [5, 5], // size of the shadow
      // iconAnchor: [2, 2], // point of the icon which will correspond to marker's location
      // shadowAnchor: [4, 62],  // the same for the shadow
      // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hasHydrantsChanges = !!changes[nameof<MapComponent>('hydrants')];
    const hasHiglightedHydrants =
      !!changes[nameof<MapComponent>('higlightedHydrants')];

    if (hasHydrantsChanges || hasHiglightedHydrants) {
      this.createHydrantLayers();
    }

    if (hasHiglightedHydrants) {
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

    // map.locate({ setView: true, watch: true, maxZoom: 17 });
    // map.locate({ setView: true, maxZoom: 17 });
  }

  onNewLocation(event: LocationEvent) {
    // console.log('New Map Location', event);
  }

  private createHydrantLayers() {
    this.hydrantLayers = this.hydrants.map((hydrant) => {
      const pin = marker([hydrant.lat, hydrant.lon], {
        icon: this.hydrantIcon,
      });

      const stateClass = this.isHydrantHighlighted(hydrant)
        ? 'hydrant-tooltip--highlighted'
        : 'hydrant-tooltip--default';

      pin.bindTooltip(hydrant.reference, {
        permanent: true,
        direction: 'top',
        opacity: 1,
        interactive: true,
        className: `hydrant-tooltip ${stateClass}`,
      });

      pin.on('click', (event: LeafletMouseEvent) => {
        event.originalEvent.stopPropagation();
        this.openHydrantDialog(hydrant);
      });

      return pin;
    });
  }

  private isHydrantHighlighted(hydrant: Hydrant): boolean {
    // the array elements are pointing to the same objects, so we can do simple ref-comparison
    return this.higlightedHydrants.includes(hydrant);
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
