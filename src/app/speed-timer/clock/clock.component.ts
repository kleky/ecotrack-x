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

    private logger: Logger;
    speed: number;

    constructor(private logService: LogService) {
        this.logger = this.logService.getLogger(`Clock`);
    }

    ngOnInit() {
        Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 6000,
            requireAltitude: false,
        }, this.updatePosition);
    }

    updatePosition = (position: GeolocationPosition, err?: any) => {
        if (err) {
            console.error("Error updating position", err);
        } else {
            console.log("Updating position", position);
            this.speed = data.coords.speed;
        }
    }

}
