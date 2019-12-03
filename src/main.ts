// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import * as application from "tns-core-modules/application";
import { BackgroundFetch } from "nativescript-background-fetch";
import { AppModule } from "./app/app.module";

platformNativeScriptDynamic().bootstrapModule(AppModule);

declare var TSBackgroundFetch: any;


