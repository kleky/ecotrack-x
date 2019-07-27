import {Pipe, PipeTransform} from "@angular/core";
import * as moment from "moment";
import {LogService} from "./services/log.service";
import {Logger} from "ionic-logging-service";


@Pipe({
  name: "dateLogged"
})
export class DateLoggedPipe implements PipeTransform {

  private logger: Logger;

  constructor(private logService: LogService) {
    this.logger = this.logService.getLogger("DateLoggedPipe");
  }

  /**
   * For date a fuel debug was logged
   * @param value Date number in UTC
   */
  transform(value: number): string {
    const date = moment(value);
    this.logger.debug("DateLoggedPipe", value, date.toISOString());
    return date.format("YYYYMMDD") === moment().format("YYYYMMDD")
      ? "today"
      :  date.format("ddd DD MMM");
  }

}
