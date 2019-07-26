import {Inject, Injectable, Pipe, PipeTransform} from "@angular/core";
import * as moment from "moment";
import {LogService} from "./services/log.service";


@Pipe({
  name: 'dateLogged'
})
export class DateLoggedPipe implements PipeTransform {

  constructor(private logger: LogService) {}

  /**
   * For date a fuel log was logged
   * @param value Date number in UTC
   */
  transform(value: number): string {
    const date = moment(value);
    return date.format("YYYYMMDD") === moment().format("YYYYMMDD")
      ? "today"
      :  date.format("ddd DD MMM")
  }

}
