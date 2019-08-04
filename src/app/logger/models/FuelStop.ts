import * as moment from "moment";

export class FuelStop {
  mileage: number;
  fuel: number;
  dateAddedUtc: string;

  constructor(fuelStop: FuelStop = null) {
    this.mileage = fuelStop ? fuelStop.mileage : null;
    this.fuel = fuelStop ? fuelStop.fuel : null;
    this.dateAddedUtc = fuelStop ? fuelStop.dateAddedUtc : moment().format();
  }

  static CreateFrom(fuelStop: FuelStop): FuelStop {
    const stop = new FuelStop(fuelStop);
    stop.dateAddedUtc = moment().format();
    return stop;
  }
}

