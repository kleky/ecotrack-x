import {Injectable} from "@angular/core";
import {Platform} from "@ionic/angular";
import {Storage} from "@ionic/storage";
import {BehaviorSubject} from "rxjs";


@Injectable({providedIn: "root"})
export class LogService  {

    constructor(
        private storage: Storage,
        private platform: Platform) {
}

    public Messages: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

    log(msg: string, obj: any = null) {
        const date = new Date().toDateString();
        if (obj) {
            this.Messages.next(
                [date + " " + msg + ": " + JSON.stringify(obj)].concat(this.Messages
                    .getValue()));
            this.platform.ready().then(async () => {
                await this.storage.ready();
                await this.storage.set("ecotrack-logs", this.Messages.getValue());
            });
        } else {
            this.Messages.next(
                [date + " " + msg].concat(this.Messages
                    .getValue()));
        }
    }

}
