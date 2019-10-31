import { Injectable } from "@angular/core";
import {Observable} from "rxjs";
import {GeolocationOptions, GeolocationPosition} from "@capacitor/core";

@Injectable({
  providedIn: "root"
})
export class LocationService {

  constructor() { }

  clearWatch(id: string): Promise<void> {

  }

  watchPosition(options: GeolocationOptions): Observable<GeolocationPosition> {
    return new Observable(subscriber => {

    });
  }
}
