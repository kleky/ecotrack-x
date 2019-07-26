import {Injectable} from '@angular/core';
import {FuelLog} from '../../models/FuelLog';
import {IVersionedData} from '../IVersionedData';

@Injectable({providedIn: 'root'})
export class UserDataStore implements IVersionedData {
  public Version = 0.4;
  public fuelLog: FuelLog;

  constructor() {
    this.fuelLog = new FuelLog();
  }
}
