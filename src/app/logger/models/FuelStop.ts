import * as moment from "moment";

export class FuelStop {
  constructor(fuelStop: FuelStop = null) {
    this.mileage = fuelStop ? fuelStop.mileage : null;
    this.fuel = fuelStop ? fuelStop.fuel : null;
    this.dateAddedUtc = fuelStop ? fuelStop.dateAddedUtc : moment().format();
  }
  mileage: number;
  fuel: number;
  dateAddedUtc: string;
}

