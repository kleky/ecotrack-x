import {Component, Input, OnInit} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {UserDataStore} from "../../data-stores/user-data/UserDataStore";
import {FuelLog} from "../../models/FuelLog";
import {FuelStop} from "../../models/FuelStop";
import {FileStore} from "../../services/file-store.service";
import {LogService} from "../../services/log.service";
import {Logger} from "ionic-logging-service";

@Component({
    selector: "app-logger",
    templateUrl: "./logger.component.html",
    styleUrls: ["./logger.component.scss"],
})
export class LoggerComponent implements OnInit {

    @Input() FuelLog: BehaviorSubject<FuelLog>;
    public newFuelStop: FuelStop;
    public fuelEconomy: number;
    private logger: Logger;

    constructor(private store: FileStore<UserDataStore>,
                private logService: LogService) {
        this.logger = this.logService.getLogger(`LoggerComponent`);
    }

    ngOnInit() {
        this.FuelLog.subscribe(() => {
            this.loadNewStop();
            this.renderEconomy();
        });
    }

    newStopIsValid(): boolean {
        return this.newFuelStop.fuel > 0;
    }

    renderEconomy() {
        if (this.FuelLog.getValue().fuelStops.length > 1) {
            this.fuelEconomy = this.calculatedEconomy(this.FuelLog.getValue().fuelStops);
            this.logger.debug("renderEconomy", "Economy calculated as " + this.fuelEconomy);
        } else {
            this.fuelEconomy = null;
        }
    }

    /**
     * @param fuelStops Ordered list with most recent fuel stop at index 0
     */
    calculatedEconomy(fuelStops: FuelStop[]) {
        const totalDistance = fuelStops[0].mileage - fuelStops[fuelStops.length - 1].mileage;
        const totalFuel = fuelStops
                .reduce((sum, curr) => sum + Number(curr.fuel), 0)
            - Number(fuelStops[fuelStops.length - 1].fuel); // take away first entry of fuel
        const gallons = totalFuel * 0.22; // litres -> gallons
        return totalDistance / gallons;
    }

    saveStop() {
        const entry = this.FuelLog.getValue();
        entry.AddFuelStop(this.newFuelStop);
        this.FuelLog.next(entry);
        // this.store.set("FuelLog", this.FuelLog);
        this.loadNewStop();
    }

    loadNewStop() {
        if (this.FuelLog.getValue().GetLastFuelStop()) {
            this.newFuelStop = FuelStop.CreateFrom(this.FuelLog.getValue().GetLastFuelStop());
        } else {
            this.newFuelStop = new FuelStop();
        }
        this.logger.debug("loadNewStop", this.newFuelStop);
    }

    removeStop(fuelStop: FuelStop) {
        const entry = this.FuelLog.getValue();
        entry.RemoveFuelStop(fuelStop);
        this.FuelLog.next(entry);
    }
}
