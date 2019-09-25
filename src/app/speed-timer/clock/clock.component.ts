import {Component} from "@angular/core";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";
import {Geolocation, GeolocationPosition} from "@capacitor/core";
import {Subscription, timer} from "rxjs";
import {takeWhile} from "rxjs/operators";

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
    elapsedTime = 0;
    distance: { distance: number, lat: number, lng: number }[] = [];

    constructor(private logService: LogService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    private startTimer() {
        this.clockStarted = true;
        this.eggTimer = timer(0, 1000)
            .pipe(takeWhile(_ => this.clockStarted))
            .subscribe(time => {
                this.elapsedTime = time;
                this.average = this.distance.length ? this.distance
                    .map(e => e.distance)
                    .reduce((prev, curr) => prev + curr) / time : 0;
            });
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
        this.distance = [];
        this.startTimer();
    }

    private updatePosition = (position: GeolocationPosition, err?: any) => {
        if (err) {
            this.logger.error("updatePosition", "Error updating position", err);
        } else {
            this.logger.debug("updatePosition", "", position);
            this.speed = position.coords.speed;
            const lastDistance = this.distance[this.distance.length - 1];
            this.distance.push({
                distance: lastDistance ? this.getDistanceFromLatLonInKm(
                    lastDistance.lat,
                    lastDistance.lng,
                    position.coords.latitude,
                    position.coords.longitude) : 0,
                lng: position.coords.longitude,
                lat: position.coords.latitude,
            });
        }
    }

    private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c) / 1.609344;  // Distance in miles
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }


}
