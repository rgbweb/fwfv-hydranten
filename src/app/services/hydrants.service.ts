import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { OverpassJson } from '../types/overpass-api.types';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Hydrant } from '../types/hydrant.class';

const MAP_AREA_NAME = 'Fredersdorf-Vogelsdorf';
const WIKIPEDIA_AREA_NAME = 'Fredersdorf-Vogelsdorf';

@Injectable({
  providedIn: 'root',
})
export class HydrantsService {
  constructor(private httpClient: HttpClient) {}

  loadHydrants(): Observable<Hydrant[]> {
    const postData = `
      [out:json];
      area[name="${MAP_AREA_NAME}"]["wikipedia"="de:${WIKIPEDIA_AREA_NAME}"];
      node["emergency"="fire_hydrant"](area);
      out;
      `;
    // NOTE: Der area[name=...] Filter soll laut Doku irgendwann entfernt werden.
    // Alternative mit simpler Bounding Box, die aber auch einige Hydranten aus Nachbarorten mit abruft:
    // `
    // [out:json][bbox:52.48582772911161,13.717632293701172,52.55495927452999,13.77737045288086];
    // node["emergency"="fire_hydrant"];
    // out;
    // `

    return this.httpClient
      .post<OverpassJson>('https://overpass-api.de/api/interpreter', postData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => 'HTTP Fehler ' + error.status);
        }),
        tap((result: OverpassJson) => {
          if (!result?.elements?.length) {
            throw Error(
              'Die Server-Abfrage hat keine Hydranten zurückgeliefert'
            );
          }

          // Kept for easier access
          console.log('Loaded elements', result.elements);
        }),
        map((result: OverpassJson) => {
          const hydrants: Hydrant[] = [];

          for (const element of result?.elements) {
            if (element.type === 'node') {
              const hydrant = new Hydrant(element);
              hydrants.push(hydrant);
            }
          }

          return hydrants;
        })
      );
  }
}
