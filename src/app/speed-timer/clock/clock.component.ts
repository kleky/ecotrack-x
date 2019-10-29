import {Component, EventEmitter} from "@angular/core";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";
import {Geolocation, GeolocationPosition} from "@capacitor/core";
import {Subscription, timer} from "rxjs";
import {takeWhile} from "rxjs/operators";
import { getDistance } from "geolib";


@Component({
    selector: "app-clock",
    templateUrl: "./clock.component.html",
    styleUrls: ["./clock.component.scss"],
})
export class ClockComponent  {

    clockStarted: boolean;
    speed: number = null;
    private logger: Logger;
    private geoWatchId: string;
    mph = true;
    average: number;
    startTime: number;
    eggTimer: Subscription;
    elapsedTime: EventEmitter<number> = new EventEmitter<number>();
    distanceMeters: { distance: number, lat: number, lng: number }[] = [];

    constructor(private logService: LogService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    private startTimer() {
        this.clockStarted = true;
        this.eggTimer = timer(0, 1000)
            .pipe(takeWhile(_ => this.clockStarted))
            .subscribe(time => {
                this.elapsedTime.emit(time);
            });
    }

    private sampleAverage(time: number) {
        this.average = this.distanceMeters.length
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
            this.startTimer();
        }
    }

    reset(): void {
        this.eggTimer.unsubscribe();
        this.distanceMeters = [];
        this.startTimer();
    }

    private updatePosition = (position: GeolocationPosition, err?: any) => {
        if (err) {
            this.logger.error("updatePosition", "Error updating position", err);
        } else {
            this.logger.debug("updatePosition", "", position);
            this.speed = position.coords.speed;
            const lastDistance = this.distanceMeters.length ? this.distanceMeters[this.distanceMeters.length - 1] : null;
            this.distanceMeters.push({
                distance: lastDistance ? this.getDistanceFromLatLonInMeters(
                    lastDistance.lat,
                    lastDistance.lng,
                    position.coords.latitude,
                    position.coords.longitude) : 0,
                lng: position.coords.longitude,
                lat: position.coords.latitude,
            });
        }
    }

    private getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        return  getDistance({latitude: lat1, longitude: lon1},
            {latitude: lat2, longitude: lon2}, 1);

    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }


}
