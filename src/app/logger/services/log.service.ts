import {Injectable} from "@angular/core";
import {Logger, LoggingService} from "ionic-logging-service";


@Injectable({providedIn: "root"})
export class LogService  {

    constructor(
        private loggingService: LoggingService) {
}

    getLogger(context: string): Logger {
        return  this.loggingService.getLogger(context);
    }

}
