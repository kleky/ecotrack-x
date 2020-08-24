import {Component, EventEmitter, OnDestroy} from "@angular/core";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";
import {Geolocation, GeolocationPosition} from "@capacitor/core";
import {BehaviorSubject, Observable, of, Subscription, timer} from "rxjs";
import {catchError, map, takeWhile, tap, withLatestFrom} from "rxjs/operators";
import {getDistance} from "geolib";
import {LocationService} from "../../services/location.service";

interface LatLng {
    lat: number;
    lng: number;
}

@Component({
    selector: "app-clock",
    templateUrl: "./clock.component.html",
    styleUrls: ["./clock.component.scss"],
})
export class ClockComponent implements OnDestroy {

    clockStarted: boolean;
    average: number;
    latestPosition = new BehaviorSubject<GeolocationPosition>(null);
    elapsedTime: EventEmitter<number> = new EventEmitter<number>();
    distanceMeters: { distance: number, pos: LatLng }[] = [];

    private logger: Logger;
    private distanceSampleSub: Subscription;
    private clockWatchSub: Subscription;

    constructor(private logService: LogService,
                private locationService: LocationService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    startStopClick(): void {
        if (this.clockStarted) {
            // STOP
            this.locationService
                .clearWatch()
                .then(_ => this.stop())
                .catch(e => this.logger.error("Failed to clear geolocation watch", e));
        } else {
            // START
            this.startClock();
            this.sampleDistances();
        }
    }

    private sampleDistances(): void {
        this.distanceSampleSub = this.watchDistanceSamples(1000).pipe(
            takeWhile(_ => this.clockStarted)
        ).subscribe(sample => {
            if (sample !== null) {
                this.pushDistance(sample);
                this.average = this.calcAveMetersPerSec(sample.time);
                console.log("Distance Sample", sample);
            }
        });
    }

    private startClock(): void {
        this.clockStarted = true;
        this.clockWatchSub = this.locationService.watchPosition({
            enableHighAccuracy: true,
            timeout: 4000,
            maximumAge: 27000,
        }).pipe(
            tap(e => console.log("watchPosition", e)),
            catchError(_ => of(null))
        ).subscribe(position => {
            if (position !== null) {
                this.latestPosition.next(position);
            } else {
                console.error("watchPosition");
            }
        });
    }

    /**
     * On timer, calculate distance travelled in meters per second
     */
    private watchDistanceSamples(interval: number): Observable<{ pos: LatLng, distanceInMeters: number, time: number }> {
        return timer(0, interval).pipe(
            tap(t => this.elapsedTime.emit(t)),
            withLatestFrom(this.latestPosition),
            tap(t => console.log("watchDistanceSamples", t)),
            tap(_ => console.log("previous position", this.previousPosition)),
            map(([time, lastPosition]) => lastPosition === null ? null :
                ({
                    pos: {lat: lastPosition.coords.latitude, lng: lastPosition.coords.longitude},
                    distanceInMeters: this.calculateDistance(
                        this.previousPosition, lastPosition.coords.latitude, lastPosition.coords.longitude),
                    time
                })
            )
        );
    }

    private get previousPosition(): LatLng {
        return this.distanceMeters.length
            ? this.distanceMeters[this.distanceMeters.length - 1].pos
            : null;
    }

    private pushDistance(sample: { pos: LatLng, distanceInMeters: number }) {
        this.distanceMeters.push({
            distance: sample.distanceInMeters,
            pos: sample.pos,
        });
    }

    private calcAveMetersPerSec(time: number): number {
        if (this.distanceMeters.length) {
            const total = this.distanceMeters.map(e => e.distance).reduce((prev, curr) => prev + curr);
            console.log(`Calculate average: ${total} / ${time}`);
            return total > 0 ?  total / time : 0;
        }
        return 0;
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

    stop(): void {
        this.distanceMeters = [];
        this.clockStarted = false;
        this.distanceSampleSub.unsubscribe();
        this.clockWatchSub.unsubscribe();
    }

    reset(): void {
        this.distanceMeters = [];
        this.distanceSampleSub.unsubscribe();
        this.sampleDistances();
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
