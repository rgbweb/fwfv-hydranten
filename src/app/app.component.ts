import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HydrantsService } from './services/hydrants.service';
import { Hydrant } from './types/hydrant.class';
import { UserSettingsService } from './services/user-settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('highlightFilterStringInput') highlightFilterStringInput:
    | ElementRef<HTMLInputElement>
    | undefined;

  isLoading = true;
  isNavbarOpen = false;

  highlightFilterString: string = '';

  hydrants: Hydrant[] = [];
  highlightedHydrants: Hydrant[] = [];

  get isMapVisible(): boolean {
    return !!this.hydrants.length;
  }

  get isHighlightButtonEnabled(): boolean {
    return (
      (!!this.highlightFilterString && !!this.filteredHydrants.length) || // um gefundene Treffer anzuzeigen
      (!this.highlightFilterString && !!this.highlightedHydrants.length) // um aktuelle Treffer zurückzusetzen, wenn das Feld wieder leer ist
    );
  }

  get highlightButtonText(): string {
    if (!this.highlightFilterString && this.highlightedHydrants.length) {
      return 'Hervorhebung zurücksetzen';
    }

    if (this.filteredHydrants.length) {
      return `${this.filteredHydrants.length} Treffer in Karte hervorheben`;
    }

    if (!this.highlightFilterString) {
      return 'In Karte hervorheben';
    }

    return 'Keine Treffer';
  }

  private filteredHydrants: Hydrant[] = [];

  constructor(
    private userSettingsService: UserSettingsService,
    private hydrantsService: HydrantsService
  ) {}

  ngOnInit() {
    this.highlightFilterString =
      this.userSettingsService.lastHighlightFilterString;

    this.loadHydrants();
  }

  updateFilteredHydrants() {
    if (!this.highlightFilterString || !this.hydrants.length) {
      this.filteredHydrants = [];
      return;
    }

    const filterStringUppperCase = this.highlightFilterString.toUpperCase();
    this.filteredHydrants =
      this.hydrants?.filter((hydrant) =>
        this.isHydrantMatchingFilter(hydrant, filterStringUppperCase)
      ) || [];
  }

  highlightFilteredHydrants() {
    this.isLoading = true;

    this.highlightFilterStringInput?.nativeElement?.blur();
    if (this.isNavbarOpen) {
      this.isNavbarOpen = false;
    }

    setTimeout(() => {
      // set the Input array for the MapComponent
      this.highlightedHydrants = this.filteredHydrants;

      // store the filter string for next page load
      this.userSettingsService.lastHighlightFilterString =
        this.highlightFilterString;

      this.isLoading = false;
    }, 100);
  }

  private loadHydrants() {
    this.hydrantsService.loadHydrants().subscribe({
      next: (hydrants: Hydrant[]) => {
        this.hydrants = hydrants;

        this.updateFilteredHydrants();
        this.highlightedHydrants = this.filteredHydrants;

        this.isLoading = false;
      },
    });
  }

  private isHydrantMatchingFilter(
    hydrant: Hydrant,
    filterStringUppperCase: string
  ): boolean {
    if (!filterStringUppperCase) {
      return false;
    }

    return hydrant.reference.startsWith(filterStringUppperCase);
  }
}
