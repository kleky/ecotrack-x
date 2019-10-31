import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {ClockComponent} from "./clock/clock.component";
import {RouterModule} from "@angular/router";
import {SpeedTimerPage} from "./speed-timer-page.component";
import {IonicModule} from "@ionic/angular";
import {ToMphPipe} from "../pipes/to-mph.pipe";
import {Geolocation, GeolocationPluginWeb} from "@capacitor/core";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    CommonModule,
    RouterModule.forChild([{path: "", component: SpeedTimerPage}])
  ],
  declarations: [ClockComponent, SpeedTimerPage, ToMphPipe],
  providers: [Geolocation],
  exports: [ToMphPipe],
})
export class SpeedTimerModule { }
