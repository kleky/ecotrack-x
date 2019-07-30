import {Component, OnDestroy, OnInit} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {FileStore} from "./services/file-store.service";
import {UserDataStore} from "./data-stores/user-data/UserDataStore";
import {LogService} from "./services/log.service";
import {ToastController} from "@ionic/angular";
import {UserDataStoreOpts} from "./data-stores/user-data/UserDataStoreOpts";
import {FuelLog} from "./models/FuelLog";
import {Logger} from "ionic-logging-service";

@Component({
    selector: "app-tab1",
    templateUrl: "logger-page.component.html",
    styleUrls: ["logger-page.component.scss"]
})
export class LoggerPage implements OnInit, OnDestroy {

    public FuelLog: BehaviorSubject<FuelLog> = new BehaviorSubject(new FuelLog());
    private logger: Logger;

    constructor(private store: FileStore<UserDataStore>,
                private logService: LogService,
                private toastController: ToastController) {
        this.logger = this.logService.getLogger(`LoggerPage`);
    }

    ngOnInit(): void {
        this.store.loadOptions(new UserDataStoreOpts()).then(e => {
            this.store.loadDataFile().subscribe(userData => {
                this.logger.debug("init - Load data file", userData);
                this.FuelLog.next(new FuelLog(userData.fuelLog));
                this.FuelLog.asObservable().subscribe(log => {
                    this.logger.debug("FuelLog Subscription", "Fuel Log change");
                    this.store.set("fuelLog", log).then(() => {
                        this.logger.debug("FuelLog Subscription", "FuelLog saved");
                    }).catch((er) => {
                        this.logger.error("FuelLog Subscription", er);
                    });
                });
            });
        }).catch((e) => {
            this.logger.error("init - loadOptions", e);
        });
    }

    async presentInfoToast() {
        const toast = await this.toastController.create({
            header: "Using EcoTrack",
            message: "For accurate results pick a point on your fuel gauge, such as the red line or quarter full. " +
                "When the needle hits this marker, enter the mileage, followed by number of litres of fuel added.",
            animated: true,
            showCloseButton: true,
        });
        await toast.present();
    }

    ngOnDestroy(): void {
    }

}
