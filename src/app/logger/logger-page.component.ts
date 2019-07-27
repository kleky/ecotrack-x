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
            message: "For accurate results record your mileage at the same time every time. " +
                "For example, always note your mileage when quarter full or at the red, then " +
                "your calculated economy will then be very accurate",
            animated: true,
            showCloseButton: true,
        });
        await toast.present();
    }

    async reset() {
        await this.store.deleteStorage(this.store.Options.type);
    }

    async output() {
        // this.logger.debug("[HOME PAGE] store: " + await this.store.readFileText(this.store.dataDir.nativeUrl, this.store.Options.path));
        this.logger.debug("[HOME PAGE] data: ", this.FuelLog.getValue());
    }

    ngOnDestroy(): void {
    }

}
