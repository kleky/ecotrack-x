import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Geolocation, GeolocationOptions, GeolocationPosition} from "@capacitor/core";

@Injectable({
    providedIn: "root"
})
export class LocationService {
    private geoWatchId: string;

    clearWatch(): Promise<void> {
      return Geolocation.clearWatch({id: this.geoWatchId});
    }

    watchPosition(options: GeolocationOptions): Observable<GeolocationPosition> {
        return new Observable(subscriber => {
            this.geoWatchId = Geolocation.watchPosition(options, (position, err) => {
                if (err) {
                    subscriber.error(err);
                } else {
                    subscriber.next(position);
                }
            });


        });
    }
}
