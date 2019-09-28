import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { BackendService } from "./shared/services/backendService";
import { LoginComponent } from "./login/login.component";


const routes: Routes = [
    { path: "", redirectTo: BackendService.isUserLoggedIn() ? "/listServices" : "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "listServices", loadChildren: () => import("~/app/list-services-driver/list-services-driver.module").then((m) => m.ListServicesDriverModule) },
    { path: "detailServices", loadChildren: () => import("~/app/detail-driver-service/detail-driver-service.module").then((m) => m.DetailDriverServiceModule) }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule],
    declarations: []
})
export class AppRoutingModule { }
