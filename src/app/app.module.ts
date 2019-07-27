import {APP_INITIALIZER, NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouteReuseStrategy} from "@angular/router";

import {IonicModule, IonicRouteStrategy} from "@ionic/angular";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {StatusBar} from "@ionic-native/status-bar/ngx";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {IonicStorageModule} from "@ionic/storage";
import {ConfigurationService} from "ionic-configuration-service";
import {LoggingService, LoggingServiceModule} from "ionic-logging-service";
import {environment} from "../environments/environment";

export function configureLogging(loggingService: LoggingService): () => void {
    return () => loggingService.configure(environment.logging);
}

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        LoggingServiceModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        ConfigurationService,
        {
            deps: [LoggingService],
            multi: true,
            provide: APP_INITIALIZER,
            useFactory: configureLogging
        }

    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
