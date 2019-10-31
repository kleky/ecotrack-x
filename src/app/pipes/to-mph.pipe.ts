import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "toMph"
})
export class ToMphPipe implements PipeTransform {

  /**
   *
   * @param value meters per second
   */
  transform(value: number): number {
    return Math.round(value * 2.237);
  }

}
