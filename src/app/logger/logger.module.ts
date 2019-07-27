import {IonicModule, ToastController} from "@ionic/angular";
import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {LoggerPage} from "./logger-page.component";
import {LoggerComponent} from "./components/logger/logger.component";
import {DateLoggedPipe} from "./date-logged.pipe";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{path: "", component: LoggerPage}])
    ],
    declarations: [
        LoggerPage,
        LoggerComponent,
        DateLoggedPipe,
    ],
    providers: [
        ToastController,
    ],
})
export class LoggerModule {
}
