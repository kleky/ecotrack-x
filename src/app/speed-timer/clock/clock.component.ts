import {Component, EventEmitter} from "@angular/core";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";
import {Geolocation, GeolocationPosition} from "@capacitor/core";
import {BehaviorSubject, Observable, of, Subscription, timer} from "rxjs";
import {map, switchMap, takeWhile, tap, withLatestFrom} from "rxjs/operators";
import { getDistance } from "geolib";

interface LatLng {
    lat: number;
    lng: number;
}

@Component({
    selector: "app-clock",
    templateUrl: "./clock.component.html",
    styleUrls: ["./clock.component.scss"],
})
export class ClockComponent  {

    clockStarted: boolean;
    average: number;
    distanceSamples: Subscription;
    latestPosition = new BehaviorSubject<GeolocationPosition>(null);
    elapsedTime: EventEmitter<number> = new EventEmitter<number>();
    distanceMeters: { distance: number, pos: LatLng }[] = [];

    private logger: Logger;
    private geoWatchId: string;

    constructor(private logService: LogService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    private get previousPosition(): LatLng {
        return this.distanceMeters.length
            ? this.distanceMeters[this.distanceMeters.length - 1].pos
            : null;
    }

    private pushDistance(sample: {pos: LatLng, distanceInMeters: number}) {
        this.distanceMeters.push({
            distance: sample.distanceInMeters,
            pos: sample.pos,
        });
    }
    /**
     * On timer, calculate distance travelled in meters per second
     */
    private sampleDistance(interval: number): Observable<{pos: LatLng, distanceInMeters: number, time: number}> {
        this.clockStarted = true;
        return  timer(0, interval)
            .pipe(
                tap(t => this.elapsedTime.emit(t)),
                withLatestFrom(this.latestPosition),
                takeWhile(([time, lastPosition]) => this.clockStarted && lastPosition !== null),
                tap(t => this.logger.debug("sampleDistance", t)),
                map(([time, lastPosition]) =>
                    ({
                        pos: { lat: lastPosition.coords.latitude, lng: lastPosition.coords.longitude},
                        distanceInMeters: this.calculateDistance(
                            this.previousPosition, lastPosition.coords.latitude, lastPosition.coords.longitude),
                        time
                    })
                )
            );
    }

    private sampleAverage(time: number): number {
        return this.distanceMeters.length > 1
            ? this.distanceMeters.map(e => e.distance).reduce((prev, curr) => prev + curr) / (time / 3600)
            : 0;
    }

    startStopClick(): void {
        if (this.clockStarted) {
            // STOP
            Geolocation
                .clearWatch({id: this.geoWatchId})
                .then(_ => this.clockStarted = false)
                .catch(e => this.logger.error("Failed to clear geolocation watch", e));
        } else {
            // START
            this.geoWatchId = Geolocation.watchPosition({
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 27000,
                requireAltitude: false,
            }, this.updatePosition);
            this.distanceSamples = this.sampleDistance(1000)
                .subscribe(sample => {
                    this.pushDistance(sample);
                    this.average = this.sampleAverage(sample.time);
                });
        }
    }

    reset(): void {
        this.distanceSamples.unsubscribe();
        this.distanceMeters = [];
        // this.sampleDistance();
    }

    private updatePosition = (position: GeolocationPosition, err?: any) => {
        if (err) {
            this.logger.error("updatePosition", "Error updating position", err);
        } else {
            this.logger.debug("updatePosition", "", position);
            this.latestPosition.next(position);
        }
    }

    /**
     * Calculate distance in meters per second
     */
    private calculateDistance(from: LatLng, toLat: number, toLong: number): number {
        return from !== null
            ? getDistance({latitude: from.lat, longitude: from.lng},
            {latitude: toLat, longitude: toLong}, 1)
            : 0;

    }
}
