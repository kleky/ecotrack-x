import {FuelStop} from './FuelStop';

export class FuelLog {

  constructor(fuelLog: FuelLog = null) {
    this.fuelStops = fuelLog !== null ? fuelLog.fuelStops : [];
  }
  public fuelStops: FuelStop[];

  public AddFuelStop(fuelStop: FuelStop) {
    this.fuelStops.unshift(new FuelStop(fuelStop));
  }

  public GetLastFuelStop(): FuelStop {
    return this.fuelStops[0];
  }

  public RemoveFuelStop(fuelStop: FuelStop) {
    this.fuelStops.splice(
      this.fuelStops.indexOf(fuelStop), 1);
  }
}
