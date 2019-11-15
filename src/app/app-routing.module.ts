import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { BackendService } from "./shared/services/backendService";
import { LoginComponent } from "./components/login/login.component";


const routes: Routes = [
    { path: "", redirectTo: false ? "/listServices" : "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "listServices", loadChildren: () => import("~/app/components/driverServices/driver.services.module").then((m) => m.ListServicesDriverModule) },
    { path: "detailServices", loadChildren: () => import("~/app/components/detail/detail.module").then((m) => m.DetailDriverServiceModule) }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule],
    declarations: []
})
export class AppRoutingModule { }
