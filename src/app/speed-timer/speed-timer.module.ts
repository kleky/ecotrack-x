import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClockComponent} from "./clock/clock.component";
import {RouterModule} from "@angular/router";
import {LoggerPage} from "../logger/logger-page.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: "", component: SpeedTimerModule}])

  ],
  declarations: [ClockComponent],
  entryComponents: [
      ClockComponent,
  ],
})
export class SpeedTimerModule { }
