import { Component, OnInit } from "@angular/core";
import {Geolocation, Geoposition} from "@ionic-native/geolocation/ngx";
import {filter, tap} from "rxjs/operators";
import {Logger} from "ionic-logging-service";
import {LogService} from "../../logger/services/log.service";

@Component({
  selector: "app-clock",
  templateUrl: "./clock.component.html",
  styleUrls: ["./clock.component.scss"],
})
export class ClockComponent implements OnInit {

  private logger: Logger;
  speed: number;

  constructor(private geolocation: Geolocation,
              private logService: LogService) {
    this.logger = this.logService.getLogger(`Clock`);
  }

  ngOnInit() {
    const watch = this.geolocation.watchPosition();
    watch.pipe(
        tap(e => this.logger.debug("Init", "Watch position result", e)),
        filter((p) => p.coords !== undefined)
    ).subscribe((data) => {
        this.speed = data.coords.speed;
    });
  }

}
