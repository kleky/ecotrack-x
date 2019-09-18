import {Component, OnInit} from "@angular/core";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";
import {Geolocation, GeolocationPosition} from "@capacitor/core";


@Component({
    selector: "app-clock",
    templateUrl: "./clock.component.html",
    styleUrls: ["./clock.component.scss"],
})
export class ClockComponent implements OnInit {

    clockStarted: boolean;
    speed: number = null;
    private logger: Logger;
    private geoWatchId: string;

    constructor(private logService: LogService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    ngOnInit() {
    }

    startStopClick(): void {
        if (this.clockStarted) {
          Geolocation
              .clearWatch({ id: this.geoWatchId })
              .then(_ => this.clockStarted = false)
              .catch(e => this.logger.error("Failed to clear geolocation watch", e));
        } else {
          this.geoWatchId = Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 27000,
            requireAltitude: false,
          }, this.updatePosition);
          this.clockStarted = true;
        }
    }

    updatePosition = (position: GeolocationPosition, err?: any) => {
        if (err) {
            console.error("Error updating position", err);
        } else {
            console.log("Updating position", position);
            this.speed = position.coords.speed;
        }
    }

}
