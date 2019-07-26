import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FileStore} from './services/file-store.service';
import {UserDataStore} from './data-stores/user-data/UserDataStore';
import {LogService} from './services/log.service';
import {ToastController} from '@ionic/angular';
import {UserDataStoreOpts} from './data-stores/user-data/UserDataStoreOpts';
import {FuelLog} from './models/FuelLog';

@Component({
  selector: 'app-tab1',
  templateUrl: 'logger-page.component.html',
  styleUrls: ['logger-page.component.scss']
})
export class LoggerPage implements OnInit, OnDestroy {

  public FuelLog: BehaviorSubject<FuelLog> = new BehaviorSubject(new FuelLog());

  constructor(private store: FileStore<UserDataStore>,
              private logger: LogService,
              private toastController: ToastController) {
  }

  ngOnInit(): void {
    this.store.loadOptions(new UserDataStoreOpts()).then(e => {
      this.store.loadDataFile().subscribe(userData => {
        this.logger.log('[HOME PAGE] Load data file : ', userData);
        this.FuelLog.next(new FuelLog(userData.fuelLog));
        this.FuelLog.asObservable().subscribe(log => {
          this.logger.log('[HOME PAGE] Fuel Log change');
          this.store.set('fuelLog', log).then(() => {
            this.logger.log('[HOME PAGE] Fuel log saved');
          }).catch(() => {
            this.logger.log('[HOME PAGE] Error saving fuel log');
          });
        });
      });
    }).catch(() => {
      this.logger.log('[HOME PAGE] Load options store error');
    });
  }

  async presentInfoToast() {
    const toast = await this.toastController.create({
      header: 'Using EcoTrack',
      message: 'For accurate results record your mileage at the same time every time. ' +
          'For example, always note your mileage when quarter full or at the red, then ' +
          'your calculated economy will then be very accurate',
      animated: true,
      showCloseButton: true,
    });
    await toast.present();
  }

  async reset() {
    await this.store.deleteStorage(this.store.Options.type);
  }

  async output() {
    // this.logger.log("[HOME PAGE] store: " + await this.store.readFileText(this.store.dataDir.nativeUrl, this.store.Options.path));
    this.logger.log('[HOME PAGE] data: ', this.FuelLog.getValue());
  }

  ngOnDestroy(): void {
  }

}
